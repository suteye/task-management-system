import { Dashboard } from "@/components/task/Dashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if(!session) redirect('/signin')

    return (
      <DashboardLayout>
        <Dashboard/>
      </DashboardLayout>
    )
}