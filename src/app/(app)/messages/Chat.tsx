import SocketChatWrapper from "./SocketChatWrapper";
export default function Chat() {


  return (
    <main className="relative w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="absolute bottom-0 top-0 flex w-full ">
        <SocketChatWrapper/>
      </div>
    </main>
  );
}
