use crate::{game::commands, util};

use super::*;

pub async fn on_send_msg_cs_req(session: &PlayerSession, body: &SendMsgCsReq) -> Result<()> {
    if body.message_text.starts_with("/") {
        commands::execute_command(&body.message_text, session).await?;
    }

    session
        .send(
            CMD_SEND_MSG_SC_RSP,
            SendMsgScRsp {
                end_time: util::cur_timestamp_seconds(),
                retcode: 0,
            },
        )
        .await
}
