import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Statistics } from "@/components/statistics"
// import { GetStarted } from "./get-started"
import { useSession } from "next-auth/react"
import Image from "next/image"

export default function RightSidebar() {
  const { data: session } = useSession()

  return (
    <div className="w-80 bg-gray-100 h-full p-4 flex flex-col shadow-sm border-l rounded-xl">
      <div className="flex justify-end space-x-2 mb-5">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        {/* <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button> */}
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User Image"}
            width={32}
            height={32}
            className="rounded-full h-8 w-8 mt-1"
          />
        )}
      </div>
      <div className="mt-8 overflow-y-auto">
        {/* <GetStarted /> */}
        <Statistics />
      </div>
    </div>
  )
}