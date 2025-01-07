import React, { useRef, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";

export function TextareaComponent(props: React.ComponentProps<"textarea">) {
  const { value, onChange, ...restProps } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (onChange) {
      onChange(e);
    }
    adjustHeight();
  }

  return (
    <Textarea
      id="auto-height-text-area"
      ref={textareaRef}
      placeholder="Type your message here."
      value={value}
      onChange={handleChange}
      className="min-h-[50px] max-h-[200px] transition-height duration-300 ease-in-out resize-none"
      {...restProps}
    />
  );
}
