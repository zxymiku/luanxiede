use common::data::EXCEL_COLLECTION;

use super::*;

pub async fn max_traces(args: &[&str], session: &PlayerSession) -> Result<()> {
    let Some(Ok(avatar_id)) = args.get(0).map(|s| s.parse::<u32>()) else {
        return send_text(session, "Usage: /avatar max_traces [avatar_id]").await;
    };

    {
        let mut player_info = session.context.player.borrow_mut();
        let avatar_comp = player_info.data.avatar_bin.as_mut().unwrap();

        let Some(avatar) = avatar_comp
            .avatar_list
            .iter_mut()
            .find(|a| a.avatar_id == avatar_id)
        else {
            return send_text(session, &format!("Avatar {avatar_id} doesn't exist")).await;
        };

        EXCEL_COLLECTION
            .avatar_skill_tree_configs
            .iter()
            .filter(|c| c.avatar_id == avatar_id)
            .map(|c| (c.point_id, c.max_level))
            .for_each(|(pt, lv)| {
                if let Some(skill_tree) = avatar
                    .skill_tree_list
                    .iter_mut()
                    .find(|st| st.point_id == pt)
                {
                    skill_tree.level = lv
                } else {
                    avatar.skill_tree_list.push(AvatarSkillTreeBin {
                        point_id: pt,
                        level: lv,
                    })
                }
            });
    }

    let avatar_mgr = session.context.avatar_mgr.borrow();
    session
        .send(
            CMD_PLAYER_SYNC_SC_NOTIFY,
            PlayerSyncScNotify {
                avatar_sync: Some(AvatarSync {
                    avatar_list: avatar_mgr.avatar_list_proto(),
                }),
                ..Default::default()
            },
        )
        .await?;

    send_text(
        session,
        &format!("Successfully maxed out traces of avatar {avatar_id}"),
    )
    .await
}
