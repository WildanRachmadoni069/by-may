interface CharacterCountSEOProps {
  current: number;
  type?: "title" | "description";
}

export default function CharacterCountSEO({
  current,
  type = "title",
}: CharacterCountSEOProps) {
  const limit = type === "title" ? 60 : 160;

  const getColor = () => {
    if (current === 0) return "text-gray-500";
    if (current <= limit) return "text-green-500";
    return "text-red-500";
  };

  const getMessage = () => {
    if (current === 0)
      return type === "title"
        ? "Judul meta belum diisi"
        : "Deskripsi meta belum diisi";
    if (current <= limit) return "Panjang teks sudah baik";
    return type === "title"
      ? "Judul terlalu panjang"
      : "Deskripsi terlalu panjang";
  };

  return (
    <div className="flex justify-between text-xs">
      <span className={getColor()}>{getMessage()}</span>
      <span className={getColor()}>
        {current}/{limit} karakter
      </span>
    </div>
  );
}
