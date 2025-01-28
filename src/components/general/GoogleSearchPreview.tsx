const GoogleSearchPreview = ({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://by-may-scarf.com";

  const truncateTitle = (text: string) => {
    if (text.length > 60) {
      return `${text.substring(0, 57)}...`;
    }
    return text;
  };

  return (
    <div className="max-w-[600px] space-y-1 font-arial">
      <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
        {truncateTitle(title) || "Judul artikel akan muncul di sini"}
      </div>
      <div className="text-[#006621] text-sm">
        {`${baseUrl}/artikel/${slug || "url-artikel"}`}
      </div>
      <div className="text-[#545454] text-sm line-clamp-2">
        {description || "Deskripsi artikel akan muncul di sini..."}
      </div>
    </div>
  );
};

export default GoogleSearchPreview;
