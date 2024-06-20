use rand::RngCore;

use super::*;
use crate::game::gameplay_conf;

pub async fn on_start_cocoon_stage_cs_req(
    session: &PlayerSession,
    body: &StartCocoonStageCsReq,
) -> Result<()> {
    let player_info = session.player_info();

    let hero_comp = player_info.data.hero_bin.as_ref().unwrap();
    let lineup_comp = player_info.data.lineup_bin.as_ref().unwrap();
    let avatar_comp = player_info.data.avatar_bin.as_ref().unwrap();
    let item_comp = player_info.data.item_bin.as_ref().unwrap();

    let lineup_bin = lineup_comp
        .lineup_list
        .iter()
        .find(|l| l.index == lineup_comp.cur_lineup_index)
        .unwrap();

    // currently this, TODO: BattleManager
    let rsp = StartCocoonStageScRsp {
        retcode: 0,
        prop_entity_id: body.prop_entity_id,
        cocoon_id: body.cocoon_id,
        wave: body.wave,
        battle_info: Some(SceneBattleInfo {
            stage_id: 201012311,
            logic_random_seed: rand::thread_rng().next_u32() % 1000000,
            battle_id: 1,
            battle_avatar_list: lineup_bin
                .avatar_list
                .iter()
                .map(|l| {
                    let avatar = avatar_comp
                        .avatar_list
                        .iter()
                        .find(|a| a.avatar_id == l.avatar_id)
                        .unwrap();

                    let equipment = item_comp
                        .equipment_list
                        .iter()
                        .find(|e| e.unique_id == avatar.equipment_unique_id);

                    BattleAvatar {
                        index: l.slot,
                        id: if l.avatar_id == 8001 {
                            hero_comp.cur_basic_type as u32
                        } else {
                            l.avatar_id
                        },
                        level: avatar.level,
                        promotion: avatar.promotion,
                        rank: avatar.rank,
                        hp: l.hp,
                        avatar_type: l.avatar_type,
                        sp: Some(AmountInfo {
                            cur_amount: l.sp,
                            max_amount: 10000,
                        }),
                        equipment_list: equipment.map_or(Vec::new(), |e| {
                            vec![BattleEquipment {
                                id: e.tid,
                                level: e.level,
                                promotion: e.promotion,
                                rank: e.rank,
                            }]
                        }),
                        skilltree_list: avatar
                            .skill_tree_list
                            .iter()
                            .map(|st| AvatarSkillTree {
                                point_id: st.point_id,
                                level: st.level,
                            })
                            .collect(),
                        relic_list: avatar
                            .relic_map
                            .iter()
                            .map(|(_, uid)| {
                                let relic = item_comp
                                    .relic_list
                                    .iter()
                                    .find(|r| r.unique_id == *uid)
                                    .unwrap();

                                BattleRelic {
                                    id: relic.tid,
                                    level: relic.level,
                                    main_affix_id: relic.main_affix_id,
                                    sub_affix_list: relic
                                        .sub_affix_list
                                        .iter()
                                        .map(|a| RelicAffix {
                                            affix_id: a.affix_id,
                                            step: a.step,
                                            cnt: a.cnt,
                                        })
                                        .collect(),
                                    ..Default::default()
                                }
                            })
                            .collect(),
                        ..Default::default()
                    }
                })
                .collect(),
            monster_wave_list: gameplay_conf
                .monster_wave_list
                .iter()
                .map(|monster_list| SceneMonsterWave {
                    monster_list: monster_list
                        .iter()
                        .map(|id| SceneMonsterData {
                            monster_id: *id,
                            ..Default::default()
                        })
                        .collect(),
                    ..Default::default()
                })
                .collect(),
            ..Default::default()
        }),
    };

    session.send(CMD_START_COCOON_STAGE_SC_RSP, rsp).await
}

pub async fn on_get_cur_battle_info_cs_req(
    session: &PlayerSession,
    _body: &GetCurBattleInfoCsReq,
) -> Result<()> {
    session
        .send(
            CMD_GET_CUR_BATTLE_INFO_SC_RSP,
            GetCurBattleInfoScRsp {
                battle_info: Some(SceneBattleInfo::default()),
                ffbpkghgmjm: Some(Fjojkdhlonn::default()),
                ..Default::default()
            },
        )
        .await
}

pub async fn on_pve_battle_result_cs_req(
    session: &PlayerSession,
    body: &PveBattleResultCsReq,
) -> Result<()> {
    session
        .send(
            CMD_P_V_E_BATTLE_RESULT_SC_RSP,
            PveBattleResultScRsp {
                retcode: 0,
                end_status: body.end_status,
                battle_id: body.battle_id,
                ..Default::default()
            },
        )
        .await
}
