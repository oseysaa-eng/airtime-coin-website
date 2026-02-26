import Link from "next/link";

export default function QuickActions() {
    
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-semibold mb-4">Quick Actions</h3>

      <div className="flex flex-col gap-3 text-sm">
        <Link href="/admin/system" className="text-teal-600 hover:underline">
          → System Controls
        </Link>
        <Link href="/admin/users" className="text-teal-600 hover:underline">
          → User Management
        </Link>
        <Link href="/admin/audit" className="text-teal-600 hover:underline">
          → Audit Logs
        </Link>
        <Link href="/admin/analytics" className="text-teal-600 hover:underline">
        
          → Advanced Analytics
        </Link>
      </div>
    </div>
  );
}


