use super::*;

pub async fn on_get_scene_map_info_cs_req(
    session: &PlayerSession,
    body: &GetSceneMapInfoCsReq,
) -> Result<()> {
    session
        .send(
            CMD_GET_SCENE_MAP_INFO_SC_RSP,
            GetSceneMapInfoScRsp {
                entry_id: body.entry_id,
                map_info_list: body
                    .entry_id_list
                    .iter()
                    .map(|id| SceneMapInfo {
                        entry_id: *id,
                        ..Default::default()
                    })
                    .collect(),
                retcode: 0,
                ..Default::default()
            },
        )
        .await
}
