"use client"
// import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users } from "lucide-react"
import { UsersTab } from "./users-tab"
import { RolesTab } from "./RolesTab"
import { useTranslations } from "next-intl"

export default function PermissionsManagement() {
  const t = useTranslations('roles')

  return (
    <div>
      <Tabs defaultValue="users" className="space-y-6">
        <div className="flex justify-between">

          {/* tabs */}
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('users-tab')}
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('roles-tab')}
            </TabsTrigger>
          </TabsList>

          {/* actions */}
          {/* //TODO: allow to add new roles and permissions in the future */}
          <div className="flex gap-2">
            {/* <Button variant="outline" size="icon">
              <Info />
            </Button> */}
            {/* <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t('new-permission')}
            </Button> */}
            {/* <Button>
              <Shield className="w-4 h-4 mr-2" />
              {t('new-role')}
            </Button> */}
          </div>
        </div>

        <TabsContent value="users">
          <UsersTab
            users={[]}
            roles={[]}
            permissions={[]}
            searchTerm=""
            onSearchChange={() => {}}
            getRoleColor={() => ""}
            getPermissionBadgeColor={() => ""}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
