import InquiryChat from "@/components/inquiry-chat";

export default function InquiryFormPage() {
  return (
    <div className="flex flex-col h-dvh bg-[#101010]">
      {/* Chat Section — fills viewport with top padding */}
      <div className="flex items-center justify-center px-0 sm:px-6 pt-10 sm:pt-12 pb-4 sm:pb-5 flex-1 min-h-0">
        <div
          className="w-full max-w-[888px] h-full rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col"
          style={{
            background:
              "linear-gradient(135deg, rgba(238, 242, 223, 0.96) 0%, rgba(243, 222, 215, 0.96) 55%, rgba(230, 239, 226, 0.96) 100%)",
          }}
        >
          <InquiryChat mode="inline" />
        </div>
      </div>
    </div>
  );
}
