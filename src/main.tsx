import { FirebaseAnalyticsProvider, FirebaseAppProvider, Footer, Header } from '@ugrc/utah-design-system';
import React from 'react';
import { createRoot } from 'react-dom/client';
import GoeoLogoDark from './goeo_logo_dark.svg';
import GoeoLogoLight from './goeo_logo_light.svg';
import './index.css';

const links = [
  {
    key: "Governor's Office of Economic Opportunity",
    action: { url: 'https://business.utah.gov' },
  },
  {
    key: 'Economic Development Corporation of Utah',
    action: { url: 'https://edcutah.org' },
  },
];

const Address = () => (
  <div className="order-last col-span-1 justify-center text-center sm:col-span-3 md:order-first md:col-span-2 md:justify-self-start md:text-start">
    <div>
      <div className="max-w-xs">
        <img src={GoeoLogoDark} alt="GOEO logo" />
      </div>
      <div className="mt-4 text-lg">
        <p>Governor&apos;s Office of Economic Opportunity</p>
      </div>
      <address className="mt-2 text-sm not-italic">
        <p>60 East South Temple</p>
        <p>Suite 300</p>
        <p>Salt Lake City, Utah 84111</p>
      </address>
      <p className="mt-2 text-sm">
        Phone: <a href="tel:(801)538-8680">(801)538-8680</a>
      </p>
      <p className="mt-2 text-sm">
        Email: <a href="mailto:business@utah.gov">business@utah.gov</a>
      </p>
    </div>
  </div>
);

const columnOne = {
  title: 'Navigation Menu',
  links: [
    {
      title: 'Home',
      url: 'https://business.utah.gov/',
    },
    {
      title: 'News',
      url: 'https://business.utah.gov/news/',
    },
    {
      title: 'Contact',
      url: 'https://business.utah.gov/contact/',
    },
    {
      title: 'Events',
      url: 'https://business.utah.gov/events/',
    },
  ],
};

const columnTwo = {
  title: 'About',
  links: [
    {
      title: 'Accolades & Rankings',
      url: 'https://business.utah.gov/accolades/',
    },
    {
      title: 'Boards',
      url: 'https://business.utah.gov/boards/',
    },
    {
      title: 'Community Data Profiles',
      url: 'https://business.utah.gov/community-data-profiles/',
    },
    {
      title: 'Grants',
      url: 'https://business.utah.gov/grants/',
    },
    {
      title: 'Events',
      url: 'https://business.utah.gov/events/',
    },
    {
      title: 'Featured Development Opportunities',
      url: 'https://business.utah.gov/development/',
    },
    {
      title: 'Publications',
      url: 'https://issuu.com/business-utah',
    },
    {
      title: 'Statewide Economic Development Contacts',
      url: 'https://business.utah.gov/statewide-economic-development-contacts/',
    },
    {
      title: 'Targeted Industries',
      url: 'https://business.utah.gov/targeted-industries/',
    },
    {
      title: 'Why Utah?',
      url: 'https://business.utah.gov/why-utah/',
    },
    {
      title: 'Workforce Services',
      url: 'https://business.utah.gov/workforce-services/',
    },
  ],
};

const columnThree = {
  title: 'Programs & Services',
  links: [
    {
      title: 'APEX Accelerator',
      url: 'https://business.utah.gov/apex/',
    },
    {
      title: 'Business Recruitment and Expansion',
      url: 'https://business.utah.gov/recruitment/',
    },
    {
      title: 'Center for Rural Development',
      url: 'https://business.utah.gov/rural/',
    },
    {
      title: 'International Trade & Diplomacy',
      url: 'https://business.utah.gov/international/',
    },
    {
      title: 'Startup State Initiative',
      url: 'https://business.utah.gov/startup-initiative/',
    },
    {
      title: 'UPSTART',
      url: 'https://business.utah.gov/upstart/',
    },
    {
      title: 'Utah Center for Global Talent',
      url: 'https://business.utah.gov/global-talent/',
    },
    {
      title: 'Utah Film Commission',
      url: 'https://film.utah.gov/',
    },
    {
      title: 'Utah Office of Regulatory Relief',
      url: 'https://business.utah.gov/regulatory-relief/',
    },
    {
      title: 'Utah Office of Tourism',
      url: 'https://travel.utah.gov/',
    },
    {
      title: 'Utah Small Business Credit Initiative',
      url: 'https://business.utah.gov/usbci/',
    },
  ],
};

let url = 'https://experience.arcgis.com/template/eb28d48dda4045b0a18dfc9b99b06e03';
if (import.meta.env.MODE !== 'production') {
  url += '?draft=true';
}

let firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

if (import.meta.env.VITE_FIREBASE_CONFIG) {
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
}

const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseAppProvider config={firebaseConfig}>
      <FirebaseAnalyticsProvider>
        <main className="flex h-screen flex-col">
          <Header links={links}>
            <div className="flex h-full grow items-center gap-3">
              {isDarkMode ? <img src={GoeoLogoDark} alt="GOEO logo" /> : <img src={GoeoLogoLight} alt="GOEO logo" />}
              <h2 className="font-heading text-2xl font-black text-zinc-600 sm:text-3xl lg:text-4xl xl:text-5xl dark:text-zinc-100">
                Economic Development Map
              </h2>
            </div>
          </Header>
          <iframe
            className="m-0 flex-1 overflow-hidden border-none p-0"
            title="Economic Development Map"
            allowFullScreen
            src={url}
          ></iframe>
        </main>
        <Footer
          renderAddress={() => <Address />}
          columnOne={columnOne}
          columnTwo={columnTwo}
          columnThree={columnThree}
        />
      </FirebaseAnalyticsProvider>
    </FirebaseAppProvider>
  </React.StrictMode>,
);
