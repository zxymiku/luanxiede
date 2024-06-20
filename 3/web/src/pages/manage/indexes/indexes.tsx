import {
  Badge,
  Button,
  createDisclosure,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  VStack,
} from "@hope-ui/solid"
import { createSignal, onCleanup, Show } from "solid-js"
import { useFetch, useT } from "~/hooks"
import { Group, PEmptyResp, PResp } from "~/types"
import {
  buildIndex,
  updateIndex,
  formatDate,
  handleResp,
  handleRespWithNotifySuccess,
  r,
} from "~/utils"
import CommonSettings from "../settings/Common"
import { LineMdConfirmCircleTwotone, LineMdLoadingTwotoneLoop } from "./icons"

type Progress = {
  obj_count: number
  is_done: boolean
  last_done_time: string
  error: string
}

const Indexes = () => {
  const t = useT()
  const [progress, setProgress] = createSignal<Progress>()
  const [progressLoading, getProgressReq] = useFetch(
    (): PResp<Progress> => r.get("/admin/index/progress"),
  )
  const refreshProgress = async () => {
    const resp = await getProgressReq()
    handleResp(resp, (data) => {
      setProgress(data)
    })
  }
  const intervalId = setInterval(refreshProgress, 5000)
  const clear = () => clearInterval(intervalId)
  onCleanup(clear)
  refreshProgress()
  const [rebuildLoading, rebuildReq] = useFetch(buildIndex)
  const rebuild = async () => {
    const resp = await rebuildReq()
    handleRespWithNotifySuccess(resp)
    refreshProgress()
  }
  const [clearIndexLoading, clearIndexReq] = useFetch(
    (): PEmptyResp => r.post("/admin/index/clear"),
  )
  const clearIndex = async () => {
    const resp = await clearIndexReq()
    handleRespWithNotifySuccess(resp)
    refreshProgress()
  }
  const [stopBuildLoading, stopBuildReq] = useFetch(
    (): PEmptyResp => r.post("/admin/index/stop"),
  )
  const stopBuild = async () => {
    const resp = await stopBuildReq()
    handleRespWithNotifySuccess(resp)
    refreshProgress()
  }

  let updatePathsRef: HTMLTextAreaElement
  let updateMaxDepthRef: HTMLInputElement
  const [updateLoading, updateReq] = useFetch(updateIndex)
  const update = async () => {
    let updatePaths: string[] = []
    if (updatePathsRef.value) {
      updatePaths = updatePathsRef.value.split("\n")
    }
    let updateMaxDepth = 20
    if (updateMaxDepthRef.value) {
      updateMaxDepth = parseInt(updateMaxDepthRef.value)
    }
    const resp = await updateReq(updatePaths, updateMaxDepth)
    handleRespWithNotifySuccess(resp)
    refreshProgress()
  }
  const { isOpen, onOpen, onClose } = createDisclosure()
  return (
    <VStack spacing="$2" w="$full" alignItems="start">
      <Heading>{t("manage.sidemenu.settings")}</Heading>
      <CommonSettings group={Group.INDEX} />
      <Heading>{t("indexes.current")}</Heading>
      <Show when={progress()}>
        <HStack
          spacing="$2"
          // w="$full"
          w="fit-content"
          shadow="$md"
          rounded="$lg"
          bg={useColorModeValue("", "$neutral3")()}
        >
          <Icon
            boxSize="$28"
            color="$accent9"
            p="$2"
            as={
              progress()?.is_done
                ? LineMdConfirmCircleTwotone
                : LineMdLoadingTwotoneLoop
            }
          />
          <VStack spacing="$2" flex="1" alignItems="start" mr="$2">
            <Text>
              {t("indexes.obj_count")}:
              <Badge colorScheme="info" ml="$2">
                {progress()?.obj_count}
              </Badge>
            </Text>
            <Text>
              {t("indexes.last_done_time")}:
              <Badge colorScheme="accent" ml="$2">
                {progress()!.last_done_time
                  ? formatDate(progress()!.last_done_time)
                  : t("indexes.unknown")}
              </Badge>
            </Text>
            <Show when={progress()?.error}>
              <Text css={{ wordBreak: "break-all" }}>
                {t("indexes.error")}:
                <Badge colorScheme="danger" ml="$2">
                  {progress()!.error}
                </Badge>
              </Text>
            </Show>
          </VStack>
        </HStack>
      </Show>
      <HStack spacing="$2">
        <Button
          colorScheme="accent"
          onClick={[refreshProgress, undefined]}
          loading={progressLoading()}
        >
          {t("global.refresh")}
        </Button>
        <Button
          colorScheme="danger"
          onClick={[clearIndex, undefined]}
          loading={clearIndexLoading()}
        >
          {t("indexes.clear")}
        </Button>
        <Button
          colorScheme="warning"
          onClick={[stopBuild, undefined]}
          loading={stopBuildLoading()}
        >
          {t("indexes.stop")}
        </Button>
        <Button onClick={[rebuild, undefined]} loading={rebuildLoading()}>
          {t(`indexes.${progress()?.is_done ? "rebuild" : "build"}`)}
        </Button>
      </HStack>
      <Button onClick={onOpen}>{t(`indexes.update`)}</Button>
      <Modal opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>{t(`indexes.update`)}</ModalHeader>
          <ModalBody>
            <Heading>{t("indexes.paths_to_update")}</Heading>
            <Textarea ref={updatePathsRef!}></Textarea>
            <Heading>{t("indexes.max_depth")}</Heading>
            <Input value={20} type="number" ref={updateMaxDepthRef!} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={[update, undefined]} loading={updateLoading()}>
              {t(`indexes.update`)}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default Indexes
