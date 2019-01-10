#!/usr/bin/env python
# * coding: utf8 *
'''
geocoding.py

A module for geocoding addresses via AGRC's web api
'''

import requests
import time
import random
import json
from os.path import abspath, dirname, join, exists


def api_retry(api_call):
    """Retry and api call if calling method returns None."""
    def retry(*args, **kwargs):
        response = api_call(*args, **kwargs)
        back_off = 1
        while response is None and back_off <= 8:
            time.sleep(back_off + random.random())
            response = api_call(*args, **kwargs)
            back_off += back_off
        return response
    return retry


class NotFoundException(Exception):
    pass


class Geocoder(object):
    _api_key = None
    _url_template = "http://api.mapserv.utah.gov/api/v1/geocode/{}/{}"
    _cache_results = False
    _cache_file_path = None
    _output_spatial_reference = None
    _cache = None

    def __init__(self, api_key, cache_results=False, output_spatial_reference=3857):
        self._api_key = api_key
        self._cache_results = cache_results
        self._output_spatial_reference = output_spatial_reference

        if cache_results:
            self._initialize_cache()

    def _initialize_cache(self):
        current_directory = abspath(dirname(__file__))
        self._cache_file_path = join(current_directory, 'geocoding_cache.json')

        if exists(self._cache_file_path):
            with open(self._cache_file_path, 'r') as file:
                self._cache = json.load(file)
        else:
            self._cache = {}

    @api_retry
    def locate(self, street, zone, **kwargs):
        cache_key = '{}, {}'.format(street, zone)
        if self._cache_results and cache_key in self._cache:
            return self._cache[cache_key]

        kwargs['apiKey'] = self._api_key
        kwargs['spatialReference'] = self._output_spatial_reference

        try:
            response = requests.get(self._url_template.format(street, zone), params=kwargs)
            response_json = response.json()
        except Exception:
            #: return None so that api_retry will try it again
            return None

        if response.status_code is not 200 or response_json['status'] is not 200:
            msg = '{}, {} was not found. {}'.format(street, zone, response_json['message'])
            print(msg)

            raise NotFoundException(msg)

        if self._cache_results:
            self._cache[cache_key] = response_json['result']

        #: result props: score, matchAddress, location
        return response_json['result']

    def __del__(self):
        if self._cache_results:
            with open(self._cache_file_path, 'w') as file:
                json.dump(self._cache, file)
