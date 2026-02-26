"use client";

type Props = {
  data: any[];
  filename?: string;
};

export default function ExportCSV({
  data,
  filename = "analytics-export.csv",
}: Props) {
  const exportCSV = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);

    const rows = data.map(row =>
      headers
        .map(h => {
          const val = row[h];
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportCSV}
      className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-zinc-800"
    >
      Export CSV
    </button>
  );
}