import {
  HStack,
  Button,
  VStack,
  Text,
  Switch as HopeSwitch,
  Input,
  FormControl,
  FormLabel,
  Flex,
} from "@hope-ui/solid"
import { r, handleRespWithoutNotify, notify } from "~/utils"
import { useFetch, useManageTitle, useT } from "~/hooks"
import {
  Meta,
  Storage,
  SettingItem,
  User,
  PResp,
  Resp,
  PEmptyResp,
  PPageResp,
} from "~/types"
import { createSignal, For } from "solid-js"
import crypto from "crypto-js"

interface Data {
  encrypted: string
  settings: SettingItem[]
  users: User[]
  storages: Storage[]
  metas: Meta[]
}
type LogType = "success" | "error" | "info"
const LogMap = {
  success: {
    icon: "✅",
    color: "$success9",
  },
  error: {
    icon: "❌",
    color: "$danger9",
  },
  info: {
    icon: "ℹ️",
    color: "$info9",
  },
}
const Log = (props: { msg: string; type: LogType }) => {
  return (
    <HStack w="$full" spacing="$1">
      <Text>{LogMap[props.type].icon}</Text>
      <Text color={LogMap[props.type].color}>{props.msg}</Text>
    </HStack>
  )
}

const BackupRestore = () => {
  const [override, setOverride] = createSignal(false)
  const [password, setPassword] = createSignal("")
  const t = useT()
  useManageTitle("manage.sidemenu.backup-restore")
  let logRef: HTMLDivElement
  const [log, setLog] = createSignal<
    {
      type: LogType
      msg: string
    }[]
  >([])
  const appendLog = (msg: string, type: LogType) => {
    setLog((prev) => [...prev, { type, msg }])
    logRef.scrollTop = logRef.scrollHeight
  }
  const [getSettingsLoading, getSettings] = useFetch(
    (): PResp<any> => r.get("/admin/setting/list"),
  )
  const [getUsersLoading, getUsers] = useFetch(
    (): PPageResp<User> => r.get("/admin/user/list"),
  )
  const [getMetasLoading, getMetas] = useFetch(
    (): PPageResp<Meta> => r.get("/admin/meta/list"),
  )
  const [getStoragesLoading, getStorages] = useFetch(
    (): PPageResp<Storage> => r.get("/admin/storage/list"),
  )
  const backupLoading = () => {
    return (
      getSettingsLoading() ||
      getUsersLoading() ||
      getMetasLoading() ||
      getStoragesLoading()
    )
  }
  function encrypt(data: any, key: string): string {
    if (key == "") return data
    const encJson = crypto.AES.encrypt(JSON.stringify(data), key).toString()
    return crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(encJson))
  }

  function decrypt(
    data: any,
    key: string,
    raw: boolean,
    encrypted: boolean,
  ): string {
    if (!encrypted) return data
    const decData = crypto.enc.Base64.parse(data).toString(crypto.enc.Utf8)
    if (raw) return crypto.AES.decrypt(decData, key).toString(crypto.enc.Utf8)
    return JSON.parse(
      crypto.AES.decrypt(decData, key).toString(crypto.enc.Utf8),
    )
  }

  const backup = async () => {
    appendLog(t("br.start_backup"), "info")
    const allData: Data = {
      encrypted: "",
      settings: [],
      users: [],
      storages: [],
      metas: [],
    }
    if (password() != "") allData.encrypted = encrypt("encrypted", password())
    for (const item of [
      { name: "settings", fn: getSettings, page: false },
      { name: "users", fn: getUsers, page: true },
      { name: "storages", fn: getStorages, page: true },
      { name: "metas", fn: getMetas, page: true },
    ] as const) {
      const resp = await item.fn()
      handleRespWithoutNotify(
        resp as Resp<any>,
        (data) => {
          appendLog(
            t("br.success_backup_item", {
              item: t(`manage.sidemenu.${item.name}`),
            }),
            "success",
          )
          if (item.page) {
            for (let i = 0; i < data.content.length; i++) {
              const obj = data.content[i]
              for (const key in obj) {
                obj[key] = encrypt(obj[key], password())
              }
            }
            allData[item.name] = data.content
          } else {
            for (let i = 0; i < data.length; i++) {
              const obj = data[i]
              for (const key in obj) {
                obj[key] = encrypt(obj[key], password())
              }
            }
            allData[item.name] = data
          }
        },
        (msg) => {
          appendLog(
            t("br.failed_backup_item", {
              item: t(`manage.sidemenu.${item.name}`),
            }) +
              ":" +
              msg,
            "error",
          )
        },
      )
    }
    download("alist_backup_" + new Date().toLocaleString() + ".json", allData)
    appendLog(t("br.finish_backup"), "info")
  }
  const [addSettingsLoading, addSettings] = useFetch(
    (data: SettingItem[]): PEmptyResp => r.post("/admin/setting/save", data),
  )
  const [addUserLoading, addUser] = useFetch((user: User): PEmptyResp => {
    return r.post(`/admin/user/create`, user)
  })
  const [addStorageLoading, addStorage] = useFetch(
    (storage: Storage): PEmptyResp => {
      return r.post(`/admin/storage/create`, storage)
    },
  )
  const [addMetaLoading, addMeta] = useFetch((meta: Meta): PEmptyResp => {
    return r.post(`/admin/meta/create`, meta)
  })
  const [updateUserLoading, updateUser] = useFetch((user: User): PEmptyResp => {
    return r.post(`/admin/user/update`, user)
  })
  const [updateStorageLoading, updateStorage] = useFetch(
    (storage: Storage): PEmptyResp => {
      return r.post(`/admin/storage/update`, storage)
    },
  )
  const [updateMetaLoading, updateMeta] = useFetch((meta: Meta): PEmptyResp => {
    return r.post(`/admin/meta/update`, meta)
  })
  async function handleOvrData<T>(
    dataArray: T[],
    getDataFunc: { (): PResp<{ content: T[]; total: number }> },
    addDataFunc: {
      (t: T): PEmptyResp
    },
    updateDataFunc: {
      (t: T): PEmptyResp
    },
    idFieldName: keyof T,
    itemName: string,
  ) {
    const currentData = (await getDataFunc()).data.content
    for (const i in dataArray) {
      const currentItem = dataArray[i]
      const currentIdValue = currentItem[idFieldName]
      const currentDataItem = currentData.find(
        (d) => d[idFieldName] === currentIdValue,
      )
      const method = currentDataItem ? "update" : "add"
      const handleDataFunc = method === "add" ? addDataFunc : updateDataFunc
      await handleRespWithoutNotify(
        await handleDataFunc(currentItem),
        () => {
          appendLog(
            t("br.success_restore_item", {
              item: t(itemName),
            }) +
              "-" +
              `[${currentIdValue}]`,
            "success",
          )
        },
        (msg) => {
          appendLog(
            t("br.failed_restore_item", {
              item: t(itemName),
            }) +
              "-" +
              `[${currentIdValue}]` +
              ":" +
              msg,
            "error",
          )
        },
      )
    }
  }
  const restoreLoading = () => {
    return (
      addSettingsLoading() ||
      addUserLoading() ||
      addStorageLoading() ||
      addMetaLoading() ||
      updateUserLoading() ||
      updateStorageLoading() ||
      updateMetaLoading()
    )
  }
  const restore = async () => {
    appendLog(t("br.start_restore"), "info")
    const file = document.createElement("input")
    file.type = "file"
    file.accept = "application/json"
    file.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || files.length === 0) {
        notify.warning(t("br.no_file"))
        return
      }
      const file = files[0]
      const reader = new FileReader()
      reader.onload = async () => {
        const data: Data = JSON.parse(reader.result as string)
        const encrypted = Boolean(data.encrypted)
        if (encrypted)
          if (
            decrypt(data.encrypted, password(), true, true) !== '"encrypted"'
          ) {
            appendLog(t("br.wrong_encrypt_password"), "error")
            return
          }
        const dataasarray = Object.values(data)
        for (let i = dataasarray.length - 4; i < dataasarray.length; i++) {
          const obj = dataasarray[i]
          console.log(obj)
          for (let a = 0; a < obj.length; a++) {
            const obj1 = obj[a]
            for (const key in obj1) {
              obj1[key] = decrypt(obj1[key], password(), false, encrypted)
            }
          }
        }
        if (override()) {
          await backup()
        }
        data.settings &&
          handleRespWithoutNotify(
            await addSettings(
              data.settings.filter(
                (s) => !["version", "index_progress"].includes(s.key),
              ),
            ),
            () => {
              appendLog(
                t("br.success_restore_item", {
                  item: t("manage.sidemenu.settings"),
                }),
                "success",
              )
            },
            (msg) => {
              appendLog(
                t("br.failed_restore_item", {
                  item: t("manage.sidemenu.settings"),
                }) +
                  ":" +
                  msg,
                "error",
              )
            },
          )
        if (override()) {
          await handleOvrData(
            data.users,
            getUsers,
            addUser,
            updateUser,
            "username",
            "manage.sidemenu.users",
          )
          await handleOvrData(
            data.storages,
            getStorages,
            addStorage,
            updateStorage,
            "mount_path",
            "manage.sidemenu.storages",
          )
          await handleOvrData(
            data.metas,
            getMetas,
            addMeta,
            updateMeta,
            "path",
            "manage.sidemenu.metas",
          )
        } else {
          for (const item of [
            { name: "users", fn: addUser, data: data.users, key: "username" },
            {
              name: "storages",
              fn: addStorage,
              data: data.storages,
              key: "mount_path",
            },
            { name: "metas", fn: addMeta, data: data.metas, key: "path" },
          ] as const) {
            for (const itemData of item.data || []) {
              itemData.id = 0
              handleRespWithoutNotify(
                await item.fn(itemData),
                () => {
                  appendLog(
                    t("br.success_restore_item", {
                      item: t(`manage.sidemenu.${item.name}`),
                    }) +
                      "-" +
                      `[${(itemData as any)[item.key]}]`,
                    "success",
                  )
                },
                (msg) => {
                  appendLog(
                    t("br.failed_restore_item", {
                      item: t(`manage.sidemenu.${item.name}`),
                    }) +
                      ` [ ${(itemData as any)[item.key]} ] ` +
                      ":" +
                      msg,
                    "error",
                  )
                },
              )
            }
          }
        }
        appendLog(t("br.finish_restore"), "info")
      }
      reader.readAsText(file)
    }
    file.click()
  }
  return (
    <VStack spacing="$2" w="$full">
      <HStack spacing="$2" w="$full">
        <Button
          loading={backupLoading()}
          onClick={() => {
            backup()
          }}
          colorScheme="accent"
        >
          {t("br.backup")}
        </Button>
        <Button
          loading={restoreLoading()}
          onClick={() => {
            restore()
          }}
        >
          {t("br.restore")}
        </Button>
      </HStack>
      <FormControl w="$full" display="flex" flexDirection="column">
        <Flex w="$full" direction="column" gap="$1">
          <FormLabel>{t(`br.override`)}</FormLabel>
          <HopeSwitch
            id="restore-override"
            checked={override()}
            onChange={(e: { currentTarget: HTMLInputElement }) =>
              setOverride(e.currentTarget.checked)
            }
          ></HopeSwitch>

          <FormLabel>{t(`br.encrypt_password`)}</FormLabel>
          <Input
            id="password"
            type="password"
            placeholder={t(`br.encrypt_password_placeholder`)}
            onInput={(e) => setPassword(e.currentTarget.value)}
          />
        </Flex>
      </FormControl>
      <VStack
        p="$2"
        ref={logRef!}
        w="$full"
        alignItems="start"
        rounded="$md"
        h="70vh"
        bg="$neutral3"
        overflowY="auto"
        spacing="$1"
      >
        <For each={log()}>{(item) => <Log {...item} />}</For>
      </VStack>
    </VStack>
  )
}

function download(filename: string, data: any) {
  const file = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(file)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default BackupRestore
