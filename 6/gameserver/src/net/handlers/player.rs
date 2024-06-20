use crate::util;

use super::*;

pub async fn on_get_basic_info_cs_req(
    session: &PlayerSession,
    _body: &GetBasicInfoCsReq,
) -> Result<()> {
    session
        .send(
            CMD_GET_BASIC_INFO_SC_RSP,
            GetBasicInfoScRsp {
                retcode: Retcode::RetSucc as u32,
                player_setting_info: Some(PlayerSettingInfo::default()),
                ..Default::default()
            },
        )
        .await
}

pub async fn on_get_hero_basic_type_info_cs_req(
    session: &PlayerSession,
    _body: &GetHeroBasicTypeInfoCsReq,
) -> Result<()> {
    let player_info = session.player_info();
    let hero_basic_type_bin = player_info.data.hero_bin.as_ref().unwrap();

    session
        .send(
            CMD_GET_HERO_BASIC_TYPE_INFO_SC_RSP,
            GetHeroBasicTypeInfoScRsp {
                retcode: Retcode::RetSucc as u32,
                gender: hero_basic_type_bin.gender.into(),
                cur_basic_type: hero_basic_type_bin.cur_basic_type.into(),
                basic_type_info_list: hero_basic_type_bin
                    .basic_type_list
                    .iter()
                    .map(|b| HeroBasicTypeInfo {
                        basic_type: b.basic_type.into(),
                        rank: b.rank,
                        ..Default::default()
                    })
                    .collect(),
                ..Default::default()
            },
        )
        .await
}

pub async fn on_player_heart_beat_cs_req(
    session: &PlayerSession,
    body: &PlayerHeartBeatCsReq,
) -> Result<()> {
    session
        .context
        .on_player_heartbeat(body.client_time_ms)
        .await?;

    session
        .send(
            CMD_PLAYER_HEART_BEAT_SC_RSP,
            PlayerHeartBeatScRsp {
                retcode: 0,
                client_time_ms: body.client_time_ms,
                server_time_ms: util::cur_timestamp_ms(),
                download_data: Some(ClientDownloadData {
                    version: 51,
                    time: util::cur_timestamp_ms() as i64,
                    data: rbase64::decode("").unwrap()
                }),
            },
        )
        .await
}
