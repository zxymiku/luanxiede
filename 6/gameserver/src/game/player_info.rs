use proto::*;

use crate::util;

pub struct PlayerInfo {
    pub uid: u32,
    pub data: PlayerDataBin,
}

impl PlayerInfo {
    pub fn new() -> Self {
        Self {
            uid: 0,
            data: PlayerDataBin::default(),
        }
    }

    pub fn init_player_data(&mut self) {
        self.data = PlayerDataBin {
            basic_bin: Some(PlayerBasicCompBin {
                level: 5,
                nickname: String::from("FireflySR"),
                created_timestamp: util::cur_timestamp_ms() as i64,
                ..Default::default()
            }),
            ..Default::default()
        }
    }

    pub fn get_cur_basic_type(&self) -> i32 {
        self.data.hero_bin.as_ref().unwrap().cur_basic_type
    }
}
