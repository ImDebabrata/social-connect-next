import React, {
  ReactNode,
  Children,
  isValidElement,
  cloneElement,
  ReactElement,
} from "react";
import Link from "next/link";
import UserLinkWithTooltip from "./UserLinkWithTooltip";

interface LinkifyProps {
  children: ReactNode;
}

/**
 * Linkify component that transforms text content into interactive links
 * - Automatically detects and links URLs, @mentions, and #hashtags
 * - Uses Next.js Link component for internal navigation
 * - Preserves original DOM structure while adding link functionality
 */
const Linkify: React.FC<LinkifyProps> = ({ children }) => {
  /**
   * Processes text content and replaces patterns with appropriate links
   * @param text - The raw text content to process
   * @returns Array of React nodes with transformed links
   */
  const processText = (text: string): ReactNode[] => {
    // Regular expression to match URLs, mentions, and hashtags
    // Group 1: URLs (including http/https/www and domain patterns)
    // Group 2: @mentions
    // Group 3: #hashtags
    const regex = /(https?:\/\/\S+|www\.\S+|\S+\.\S+)|@(\w+)|#(\w+)/g;

    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyCount = 0;

    while ((match = regex.exec(text)) !== null) {
      const index = match.index;
      const [, url, mention, hashtag] = match;

      // Add any plain text that exists before the current match
      if (index > lastIndex) {
        parts.push(text.substring(lastIndex, index));
      }

      // Handle URL matches
      if (url) {
        let href = url;
        // Add http protocol if missing
        if (!/^https?:\/\//i.test(href)) {
          href = `http://${href}`;
        }
        parts.push(
          <a
            key={`link-${keyCount++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {url}
          </a>
        );
      }
      // Handle @mentions
      else if (mention) {
        parts.push(
          <UserLinkWithTooltip key={`link-${keyCount++}`} username={mention}>
            @{mention}
          </UserLinkWithTooltip>
        );
      }
      // Handle #hashtags
      else if (hashtag) {
        parts.push(
          <Link
            key={`link-${keyCount++}`}
            href={`/hashtag/${hashtag}`}
            className="text-blue-600 hover:underline"
          >
            {`#${hashtag}`}
          </Link>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  /**
   * Recursively processes React nodes to transform text content
   * @param node - React node to process
   * @returns Processed React node with transformed links
   */
  const processNode = (node: ReactNode): ReactNode => {
    // If node is a string, process it directly
    if (typeof node === "string") {
      return processText(node);
    }

    // If node is a React element, process its children recursively
    if (isValidElement(node)) {
      const element = node as ReactElement<LinkifyProps>;
      const children = Children.map(element.props.children, (child) =>
        processNode(child)
      );

      // Clone the element with processed children while preserving original props
      return cloneElement(element, element.props, children);
    }

    // Return other node types unchanged (numbers, booleans, etc.)
    return node;
  };

  // Main component render - processes all children recursively
  return <>{Children.map(children, (child) => processNode(child))}</>;
};

export default Linkify;
