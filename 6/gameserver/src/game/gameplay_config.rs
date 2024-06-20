use common::util::load_or_create_config;
use lazy_static::lazy_static;
use serde::Deserialize;
use serde_json::from_str;

const DEFAULT_GLOBALS: &str = include_str!("../../gameplay.json");

lazy_static! {
    pub static ref INSTANCE: Globals = {
        let data = load_or_create_config("gameplay.json", DEFAULT_GLOBALS);
        from_str(&data).unwrap()
    };
}

#[derive(Deserialize)]
pub struct Globals {
    pub hero_gender: String,
    pub hero_basic_type: String,
    pub monster_wave_list: Vec<Vec<u32>>,
}
