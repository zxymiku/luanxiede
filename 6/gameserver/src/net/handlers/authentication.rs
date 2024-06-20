use anyhow::Result;
use proto::*;

use crate::{database, net::PlayerSession, util};

pub async fn on_player_get_token_cs_req(
    session: &PlayerSession,
    body: &PlayerGetTokenCsReq,
) -> Result<()> {
    if !database::verify_combo_token(&body.account_uid, &body.token).await? {
        return session
            .send(
                CMD_PLAYER_GET_TOKEN_SC_RSP,
                PlayerGetTokenScRsp {
                    retcode: Retcode::RetAccountVerifyError as u32,
                    msg: String::from("Account token is invalid. Please relogin and try again."),
                    ..Default::default()
                },
            )
            .await;
    }

    let (uid, player_bin) = database::get_player_bin_by_account_uid(&body.account_uid).await?;
    session.context.on_player_get_token_succ(uid, player_bin);

    session
        .send(
            CMD_PLAYER_GET_TOKEN_SC_RSP,
            PlayerGetTokenScRsp {
                uid,
                ..Default::default()
            },
        )
        .await
}

pub async fn on_player_login_cs_req(
    session: &PlayerSession,
    body: &PlayerLoginCsReq,
) -> Result<()> {
    if session.context.is_new_player() {
        session.context.init_default_player();
    }

    session.context.on_player_logged_in().await?;
    session
        .send(
            CMD_PLAYER_LOGIN_SC_RSP,
            PlayerLoginScRsp {
                login_random: body.login_random,
                server_timestamp_ms: util::cur_timestamp_ms(),
                stamina: 240,
                basic_info: Some(session.context.player_basic_info_proto()),
                ..Default::default()
            },
        )
        .await
}
