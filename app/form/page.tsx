import InquiryChat from "@/components/inquiry-chat";

export default function FormPage() {
  return (
    <div className="min-h-screen bg-black text-white py-10 sm:py-20 px-4">
      <div className="w-full max-w-[888px] mx-auto h-[calc(100vh-120px)] sm:h-[calc(100vh-160px)] bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden flex flex-col">
        <InquiryChat mode="inline" />
      </div>
    </div>
  );
}
