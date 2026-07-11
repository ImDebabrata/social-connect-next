import SocketChatWrapper from "./SocketChatWrapper";

export default function Chat() {
  return (
    <main className="flex min-h-0 w-full overflow-hidden rounded-2xl border bg-card shadow-sm">
      <SocketChatWrapper />
    </main>
  );
}
