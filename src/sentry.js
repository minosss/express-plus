import React from 'react';
import * as Sentry from '@sentry/browser';

const useSentry = process.env.NODE_ENV === 'production' && process.env.APP_SENTRY_DSN;

if (useSentry) {
  console.log('init sentry');
  Sentry.init({
    dsn: process.env.APP_SENTRY_DSN
  });
}

class SentryBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  componentDidCatch(error, errorInfo) {
    this.setState({error});
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  }

  render() {
    return this.props.children;
  }
}

export default function withSentry(App) {
  if (useSentry) {
    return () => (
      <SentryBoundary>
        <App />
      </SentryBoundary>
    );
  }

  return App;
}
