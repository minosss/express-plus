import React from 'react';
import * as Sentry from '@sentry/browser';

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
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN
    });

    return (
      <SentryBoundary>
        <App />
      </SentryBoundary>
    );
  }

  return App;
}