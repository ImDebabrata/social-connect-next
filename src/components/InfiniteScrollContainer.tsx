import { useInView } from "react-intersection-observer";

import React from "react";

interface InfiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
}

function InfiniteScrollContainer(props: InfiniteScrollContainerProps) {
  const { children, onBottomReached, className = "" } = props;

  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        onBottomReached();
      }
    },
  });
  return (
    <div className={className}>
      {children}
      <div ref={ref} />
    </div>
  );
}

export default InfiniteScrollContainer;
