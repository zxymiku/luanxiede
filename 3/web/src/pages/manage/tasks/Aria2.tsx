import { VStack } from "@hope-ui/solid"
import { useManageTitle } from "~/hooks"
import { TypeTasks } from "./Tasks"

const Aria2 = () => {
  useManageTitle("manage.sidemenu.aria2")
  return (
    <VStack w="$full" alignItems="start" spacing="$4">
      <TypeTasks type="aria2_down" canRetry />
      <TypeTasks type="aria2_transfer" />
    </VStack>
  )
}

export default Aria2
