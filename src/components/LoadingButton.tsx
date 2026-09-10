import { cn } from "@/lib/utils";
import { LoadingIcon } from "@/constrants/ImageConfig";
import { Button, ButtonProps } from "./ui/button";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {loading && <LoadingIcon className="size-5 animate-spin" />}
      {props.children}
    </Button>
  );
}
