/* eslint-disable max-len */
import {computed} from '@ember/object';

function metaTagLookup(headTagKey) {
  return computed(headTagKey, function() {
    return headTags[headTagKey];
  });
}

const headTags = {
  root: [
    metaTitle('Percy | Automated Visual Testing - Visual Regression Testing'),
    metaDescription(
      'Powered by cross-browser testing, responsive visual testing, and smart visual regression testing, Percy helps teams design, develop, and deploy software with confidence.',
    ),
  ],
  features: [
    metaTitle('Visual testing product features | Percy'),
    metaDescription(
      'Learn more about Percy’s product features including smart diff technology, efficient visual reviews, leading rendering engine, and effortless integrations.',
    ),
  ],
  howItWorks: [
    metaTitle('Comprehensive guide to visual testing | Percy'),
    metaDescription(
      'Percy makes it easy to integrate snapshots, run visual tests, and review visual diffs. Get started with visual testing and start deploying with confidence.',
    ),
  ],
  visualTesting: [
    metaTitle('What is visual testing? | Percy'),
    metaDescription(
      'Learn why teams are replacing manual QA with automated visual testing to ensure their websites and applications are pixel-perfect.',
    ),
  ],
  pricing: [
    metaTitle('Visual Testing Plans and Pricing | Percy'),
    metaDescription(
      'Get started with Percy’s visual testing plans. Start testing your UI for visual changes today with our free plan or learn about our enterprise pricing.',
    ),
  ],
  enterprise: [
    metaTitle('Enterprise Visual Testing at Scale | Percy'),
    metaDescription(
      'Percy the trusted visual testing provider for the most innovative teams. Learn more about our enterprise browser rendering infrastructure, integrations, and more.',
    ),
  ],
  team: [
    metaTitle('About Percy | Visual Testing As a Service'),
    metaDescription(
      'The Percy team is helping teams design, develop, and deliver software with confidence through visual testing as a service. Learn more about the people behind Percy.',
    ),
  ],
  changelog: [
    metaTitle('Visual Testing Platform Changelog | Percy'),
    metaDescription(
      'See what team Percy is building to make automated visual testing more efficient and accessible to all. Stay up to date with new Percy features, integrations, and updates.',
    ),
  ],
  scheduleDemo: [
    metaTitle('Request a visual testing demo | Percy'),
    metaDescription(
      'Contact Percy with any questions about how visual testing works, to learn more about our visual testing plans, or to schedule a product demo.',
    ),
  ],
  integrations: [
    metaTitle('Seamless visual testing integrations | Percy'),
    metaDescription(
      'Percy is designed to easily integrate with your stack to get started with visual testing. Learn more about how Percy integrates with web apps, component libraries, test frameworks, CI/CD services, and source code managers.',
    ),
  ],
  customers: [
    metaTitle('Percy customers | Visual testing case studies'),
    metaDescription(
      'Learn why the most innovative teams have implemented automated visual testing. Percy helps teams reduce the risk of visual regressions and gain confidence on each deploy.',
    ),
  ],
};

function metaDescription(content) {
  return {
    type: 'meta',
    attrs: {
      content,
      name: 'description',
    },
  };
}

function metaTitle(content) {
  return {
    type: 'meta',
    attrs: {
      content,
      name: 'title',
    },
  };
}

export default metaTagLookup;
