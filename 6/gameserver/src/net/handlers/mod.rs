mod authentication;
mod avatar;
mod battle;
mod chat;
mod friend;
mod item;
mod lineup;
mod map;
mod mission;
mod player;
mod scene;
mod tutorial;

use anyhow::Result;
use paste::paste;
use proto::*;

use super::PlayerSession;

pub use authentication::*;
pub use avatar::*;
pub use battle::*;
pub use chat::*;
pub use friend::*;
pub use item::*;
pub use lineup::*;
pub use map::*;
pub use mission::*;
pub use player::*;
pub use scene::*;
pub use tutorial::*;

#[allow(unused_imports)]
use proto::{
    CmdActivityType::*, CmdAdventureType::*, CmdAetherDivideType::*, CmdAlleyType::*,
    CmdArchiveType::*, CmdAvatarType::*, CmdBattleCollegeType::*, CmdBattlePassType::*,
    CmdBattleType::*, CmdBoxingClubType::*, CmdChallengeType::*, CmdChatType::*,
    CmdChessRogueType::*, CmdClockParkType::*, CmdContentPackageType::*, CmdDailyActiveType::*,
    CmdDrinkMakerType::*, CmdEvolveBuildType::*, CmdExpeditionType::*,
    CmdFantasticStoryActivityType::*, CmdFeverTimeActivityType::*, CmdFightActivityType::*,
    CmdFightMathc3Type::*, CmdFightType::*, CmdFriendType::*, CmdGachaType::*, CmdHeartdialType::*,
    CmdHeliobusType::*, CmdItemType::*, CmdJukeboxType::*, CmdLineupType::*, CmdLobbyType::*,
    CmdMailType::*, CmdMapRotationType::*, CmdMatchThreeModuleType::*, CmdMatchType::*,
    CmdMessageType::*, CmdMiscModuleType::*, CmdMissionType::*, CmdMonopolyType::*,
    CmdMultiplayerType::*, CmdMultipleDropType::*, CmdMuseumType::*, CmdOfferingType::*,
    CmdPamMissionType::*, CmdPhoneType::*, CmdPlayerBoardType::*, CmdPlayerReturnType::*,
    CmdPlayerSync::*, CmdPlayerType::*, CmdPlotType::*, CmdPunkLordType::*, CmdQuestType::*,
    CmdRaidCollectionType::*, CmdRaidType::*, CmdRedDotType::*, CmdReplayType::*,
    CmdRndOptionType::*, CmdRogueCommonType::*, CmdRogueEndless::*, CmdRogueModifierType::*,
    CmdRogueTournType::*, CmdRogueType::*, CmdRollShopType::*, CmdSceneType::*,
    CmdServerPrefsType::*, CmdShopType::*, CmdSpaceZooType::*, CmdStarFightType::*,
    CmdStoryLineType::*, CmdStrongChallengeActivityType::*, CmdTalkRewardType::*,
    CmdTelevisionActivityType::*, CmdTextJoinType::*, CmdTrainVisitorType::*,
    CmdTravelBrochureType::*, CmdTreasureDungeonType::*, CmdTutorialType::*, CmdWaypointType::*,
    CmdWolfBroType::*,
};

macro_rules! dummy {
    ($($cmd:ident),* $(,)*) => {
        paste! {
            impl PlayerSession {
                pub const fn should_send_dummy_rsp(cmd_id: u16) -> bool {
                    match cmd_id {
                        $(
                            x if x == [<Cmd $cmd CsReq>] as u16 => true,
                        )*
                        _ => false,
                    }
                }

                pub async fn send_dummy_response(&self, req_id: u16) -> Result<()> {
                    let cmd_type = match req_id {
                        $(
                            x if x == [<Cmd $cmd CsReq>] as u16 => [<Cmd $cmd ScRsp>] as u16,
                        )*
                        _ => return Err(anyhow::anyhow!("Invalid request id {req_id:?}")),
                    };



                    self.send_dummy(cmd_type).await?;
                    Ok(())
                }
            }
        }
    };
}

dummy! {
    InteractProp,
    GetFirstTalkNpc,
    GetMarkItemList,
    GetAllServerPrefsData,
    GetLevelRewardTakenList,
    GetRogueScoreRewardInfo,
    GetRogueCommonDialogueData,
    GetRogueEndlessActivityData,
    GetMonsterResearchActivityData,
    GetMainMissionCustomValue,
    GetGachaInfo,
    QueryProductInfo,
    GetQuestData,
    GetQuestRecord,
    GetFriendApplyListInfo,
    GetCurAssist,
    GetRogueHandbookData,
    GetDailyActiveInfo,
    GetFightActivityData,
    GetMultipleDropInfo,
    GetPlayerReturnMultiDropInfo,
    GetShareData,
    GetTreasureDungeonActivityData,
    PlayerReturnInfoQuery,
    GetPlayerBoardData,
    GetActivityScheduleConfig,
    GetMissionData,
    GetMissionEventData,
    GetChallenge,
    GetCurChallenge,
    GetRogueInfo,
    GetExpeditionData,
    GetJukeboxData,
    SyncClientResVersion,
    DailyFirstMeetPam,
    GetMuseumInfo,
    GetLoginActivity,
    GetRaidInfo,
    GetTrialActivityData,
    GetBoxingClubInfo,
    GetNpcStatus,
    TextJoinQuery,
    GetSpringRecoverData,
    GetChatFriendHistory,
    GetSecretKeyInfo,
    GetVideoVersionKey,
    GetCurBattleInfo,
    GetPhoneData,
    PlayerLoginFinish,
    RogueTournQuery,
    GetBattleCollegeData,
    GetHeartDialInfo,
    HeliobusActivityData,
    GetEnteredScene,
    GetAetherDivideInfo,
    GetMapRotationData,
    GetRogueCollection,
    GetRogueExhibition,
    GetNpcMessageGroup,
    GetFriendLoginInfo,
    GetChessRogueNousStoryInfo,
    CommonRogueQuery,
    GetStarFightData,
    EvolveBuildQueryInfo,
    GetAlleyInfo,
    GetAetherDivideChallengeInfo,
    GetStrongChallengeActivityData,
    GetOfferingInfo,
    ClockParkGetInfo,
    GetGunPlayData,
    SpaceZooData,
    GetUnlockTeleport,
    TravelBrochureGetData,
    RaidCollectionData,
    GetChatEmojiList,
    GetTelevisionActivityData,
    GetTrainVisitorRegister,
    GetLoginChatInfo,
    GetFeverTimeActivityData,
    GetAllSaveRaid
}
