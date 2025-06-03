import { LogOut, RefreshCw } from "lucide-react"  // Add RefreshCw import
import { signOut } from "next-auth/react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"  // Add this import

interface ProfilePopoverProps {
  userImage: string;
  userName: string;
  userEmail: string;
}

export function ProfilePopover({ userImage, userName, userEmail }: ProfilePopoverProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.push('/subscriptions?showModal=true');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Image
            src={userImage}
            alt={userName || "User Image"}
            width={32}
            height={32}
            className="rounded-full h-8 w-8"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <Image
              src={userImage}
              alt={userName || "User Image"}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-medium">{userName}</span>
              <span className="text-sm text-gray-500 truncate">{userEmail}</span>
            </div>
          </div>
          <hr className="border-gray-200" />
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Emails
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}