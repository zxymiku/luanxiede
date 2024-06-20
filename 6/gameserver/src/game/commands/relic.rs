use super::*;

const GIVE_RELIC_USAGE: &'static str = "Usage: /relic give [id] [level] [main_affix] [sub_affix_count] [sub_affix1_id] [sub_affix1_cnt] ...";
pub async fn give(args: &[&str], session: &PlayerSession) -> Result<()> {
    if args.len() < 4 {
        return send_text(session, GIVE_RELIC_USAGE).await;
    }

    let id = args[0].parse::<u32>()?;
    let level = args[1].parse::<u32>()?;
    let main_affix = args[2].parse::<u32>()?;
    let sub_affix_count = args[3].parse::<usize>()?;

    if args.len() - 4 < (sub_affix_count * 2) as usize {
        return send_text(session, GIVE_RELIC_USAGE).await;
    }

    let mut sub_affix_params = Vec::with_capacity(sub_affix_count);

    let args = &args[4..];
    for i in 0..sub_affix_count {
        let sub_affix_id = args[i * 2].parse::<u32>()?;
        let sub_affix_cnt = args[i * 2 + 1].parse::<u32>()?;

        sub_affix_params.push((sub_affix_id, sub_affix_cnt));
    }

    let item_mgr = session.context.item_mgr.borrow();
    item_mgr.give_relic(id, level, main_affix, sub_affix_params)?;

    session
        .send(
            CMD_PLAYER_SYNC_SC_NOTIFY,
            PlayerSyncScNotify {
                relic_list: item_mgr.relic_list_proto(),
                ..Default::default()
            },
        )
        .await?;

    send_text(session, "Relic added successfully").await
}
