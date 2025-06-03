import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Statistics } from "@/components/statistics"
import { useSession } from "next-auth/react"
import { ProfilePopover } from "@/components/profile-popover"

export default function RightSidebar() {
  const { data: session } = useSession()

  return (
    <div className="w-80 bg-gray-100 h-full p-4 flex flex-col shadow-sm border-l rounded-xl">
      <div className="flex justify-end space-x-2 mb-5">
        {/* <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button> */}
        {session?.user?.image && session?.user?.name && session?.user?.email && (
          <ProfilePopover
            userImage={session.user.image}
            userName={session.user.name}
            userEmail={session.user.email}
          />
        )}
      </div>
      <div className="mt-8 overflow-y-auto">
        <Statistics />
      </div>
    </div>
  )
}