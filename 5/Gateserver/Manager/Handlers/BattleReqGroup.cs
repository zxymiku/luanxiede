using FreeSR.Gateserver.Manager.Handlers.Core;
using static FreeSR.Gateserver.Manager.Handlers.LineupReqGroup;
using FreeSR.Gateserver.Network;
using FreeSR.Proto;

namespace FreeSR.Gateserver.Manager.Handlers
{
    internal static class BattleReqGroup
    {
        [Handler(CmdType.CmdSetLineupNameCsReq)]
        public static void OnSetLineupNameCsReq(NetSession session, int cmdId, object data)
        {
            var request = data as SetLineupNameCsReq;
            if(request.Name == "battle")
            {
                
                var lineupInfo = new LineupInfo
                {
                    ExtraLineupType = ExtraLineupType.LineupNone,
                    Name = "Squad 1",
                    Mp = 5,
                    MaxMp = 5,
                    LeaderSlot = 0
                };
                List<uint> characters = new List<uint> { Avatar1, Avatar2, Avatar3, Avatar4 };
                foreach (uint id in characters)
                {
                    if (id == 0) continue;
                    lineupInfo.AvatarLists.Add(new LineupAvatar
                    {
                        Id = id,
                        Hp = 10000,
                        Satiety = 100,
                        Sp = new AmountInfo{CurAmount = 10000,MaxAmount = 10000},
                        AvatarType = AvatarType.AvatarFormalType,
                        Slot = (uint)lineupInfo.AvatarLists.Count
                    });
                }

                var sceneInfo = new SceneInfo
                {
                    GameModeType = 2,
                    EntryId = 2010101,
                    PlaneId = 20101,
                    FloorId = 20101001
                };

                var calaxInfoTest = new SceneEntityInfo
                {
                    GroupId = 19,
                    InstId = 300001,
                    EntityId = 4194583,
                    Prop = new ScenePropInfo
                    {
                        PropState = 1,
                        PropId = 808
                    },
                    Motion = new MotionInfo
                    {
                        Pos = new Vector
                        {
                            X = -570,
                            Y = 19364,
                            Z = 4480
                        },
                        Rot = new Vector
                        {
                            Y = 180000
                        }
                    },
                };

                sceneInfo.EntityLists.Add(calaxInfoTest);

                session.Send(CmdType.CmdEnterSceneByServerScNotify, new EnterSceneByServerScNotify
                {
                    Scene = sceneInfo,
                    Lineup = lineupInfo
                });

                session.Send(CmdType.CmdSceneEntityMoveScNotify, new SceneEntityMoveScNotify
                {
                    EntryId = 2010101,
                    EntityId = 0,
                    Motion = new MotionInfo
                    {
                        Pos = new Vector
                        {
                            X = -570,
                            Y = 19364,
                            Z = 4480
                        },
                        Rot = new Vector
                        {
                            Y = 180000
                        }
                    }
                });
            }

            session.Send(CmdType.CmdSetLineupNameScRsp, new SetLineupNameScRsp
            {
                Retcode = 0,
                Name = request.Name,
                Index = request.Index
            });
        }


        [Handler(CmdType.CmdStartCocoonStageCsReq)]
        public static void OnStartCocoonStageCsReq(NetSession session, int cmdId, object data)
        {
            var request = data as StartCocoonStageCsReq;

            Dictionary<uint, List<uint>> monsterIds = new Dictionary<uint, List<uint>>
            {
                { 1, new List<uint> { 3013010, 3012010, 3013010, 3001010 } },
                { 2, new List<uint> { 8034010 } },
                { 3, new List<uint> { 3014022 } },
            };

            Dictionary<uint, uint> monsterLevels = new Dictionary<uint, uint>
            {
                {1,70},{2,70},{3,60}
            };

            //basic
            var battleInfo = new SceneBattleInfo
            {
                StageId = 201012311,
                LogicRandomSeed = 639771447,
                WorldLevel = 6
            };

            var testRelic = new BattleRelic
            {
                Id = 61011,
                Level = 999,
                MainAffixId = 1,
                SubAffixLists = {new RelicAffix
                {
                    AffixId = 4,
                    Step = 999
                } }
            };

            //avatar
            List<uint> SkillIdEnds = new List<uint> { 1, 2, 3, 4, 7, 101, 102, 103, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210 };
            List<uint> characters = new List<uint> { Avatar1, Avatar2, Avatar3, Avatar4 };
            foreach (uint avatarId in characters)
            {
                var avatarData = new BattleAvatar
                {
                    Id = avatarId,
                    Level = 80,
                    Promotion = 6,
                    Rank = 6,
                    Hp = 10000,
                    AvatarType = AvatarType.AvatarFormalType,
                    WorldLevel = 6,
                    Sp = new AmountInfo { CurAmount = 10000, MaxAmount = 10000 },
                    RelicLists = { testRelic },
                    EquipmentLists = {new BattleEquipment
                    {
                        Id = 23006,
                        Level = 80,
                        Rank = 5,
                        Promotion = 6
                    } }
                };

                foreach (uint end in SkillIdEnds)
                {
                    uint level = 1;
                    if (end == 1) level = 6;
                    else if (end < 4 || end == 4) level = 10;
                    if (end > 4) level = 1;
                    avatarData.SkilltreeLists.Add(new AvatarSkillTree
                    {
                        PointId = avatarId * 1000 + end,
                        Level = level
                    });
                }

                battleInfo.BattleAvatarLists.Add(avatarData);
            }

            //monster
            for (uint i = 1; i <= monsterIds.Count; i++)
            {
                SceneMonsterWave monsterInfo = new SceneMonsterWave
                {
                    Pkgenfbhofi = i,
                    MonsterParam = new SceneMonsterParam
                    {
                        Level = monsterLevels[i],
                    }
                };

                if (monsterIds.ContainsKey(i))
                {
                    List<uint> monsterIdList = monsterIds[i];

                    foreach (uint monsterId in monsterIdList)
                    {
                        monsterInfo.MonsterLists.Add(new SceneMonsterInfo
                        {
                            MonsterId = monsterId
                        });
                    }
                    
                }
                battleInfo.MonsterWaveLists.Add(monsterInfo);
            }

            var response = new StartCocoonStageScRsp
            {
                Retcode = 0,
                CocoonId = request.CocoonId,
                Wave = request.Wave,
                PropEntityId = request.PropEntityId,
                BattleInfo = battleInfo
            };

            session.Send(CmdType.CmdStartCocoonStageScRsp, response);
        }

        [Handler(CmdType.CmdPVEBattleResultCsReq)]
        public static void OnPVEBattleResultCsReq(NetSession session, int cmdId, object data)
        {
            var request = data as PVEBattleResultCsReq;
            session.Send(CmdType.CmdPVEBattleResultScRsp, new PVEBattleResultScRsp
            {
                Retcode = 0,
                EndStatus = request.EndStatus
            });
        }
    }
}
