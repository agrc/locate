#!/usr/bin/env python
# * coding: utf8 *
'''
SureSitePallet.py

A forklift pallet for suresites data
'''

import requests
from forklift import seat
from forklift.models import Pallet
from json import dump
from os import makedirs
from os.path import abspath
from os.path import dirname
from os.path import exists
from os.path import join
from time import clock
from time import strftime

data_file = join(abspath(dirname(__file__)), 'data')


class SureSitePallet(Pallet):
    def __init__(self):
        super(SureSitePallet, self).__init__()

    def is_ready_to_ship(self):
        ready = strftime('%A') == 'Monday'
        if not ready:
            self.success = (True, 'This pallet only runs on Monday.')

        return ready

    def ship(self):
        start_seconds = clock()
        r = requests.get('http://utahsuresites.com/rest/properties-all', timeout=30)
        self.log.debug('utahsuresites.com receieved in %s with response code %s', seat.format_time(clock() - start_seconds), r.status_code)

        r.raise_for_status()
        sites = r.json()

        if not exists(data_file):
            makedirs(data_file)

        sites_file = join(data_file, 'sites.json')
        self.log.debug('writing to %s', sites_file)

        with open(sites_file, 'w') as f:
            dump(sites, f)
