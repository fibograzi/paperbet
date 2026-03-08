"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  gameName?: string;
}

interface State {
  hasError: boolean;
}

export default class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-pb-danger/10 flex items-center justify-center">
            <span className="text-pb-danger text-2xl font-bold">!</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-pb-text-primary">
            Something went wrong
          </h2>
          <p className="text-pb-text-secondary text-sm max-w-sm">
            {this.props.gameName
              ? `The ${this.props.gameName} game encountered an error.`
              : "The game encountered an error."}{" "}
            Try refreshing or click the button below.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-6 py-2.5 rounded-lg bg-pb-accent text-pb-bg-primary font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
