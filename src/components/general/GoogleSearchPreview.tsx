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
    // Add the template suffix
    const fullTitle = `${text} | By May Scarf`;

    if (fullTitle.length > 60) {
      return `${fullTitle.substring(0, 57)}...`;
    }
    return fullTitle;
  };

  return (
    <div className="max-w-[600px] space-y-1 font-arial">
      <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
        {truncateTitle(title || "Judul artikel akan muncul di sini")}
      </div>
      <div className="text-[#006621] text-sm">
        {`${baseUrl}/${slug || "url-artikel"}`}
      </div>
      <div className="text-[#545454] text-sm line-clamp-2">
        {description || "Deskripsi artikel akan muncul di sini..."}
      </div>
    </div>
  );
};

export default GoogleSearchPreview;
