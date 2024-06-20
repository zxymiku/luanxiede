
            /// Returns the `rustc` SemVer version and additional metadata
            /// like the git short hash and build date.
            pub fn version_meta() -> VersionMeta {
                VersionMeta {
                    semver: Version {
                        major: 1,
                        minor: 80,
                        patch: 0,
                        pre: vec![semver::Identifier::AlphaNumeric("nightly".to_owned()), ],
                        build: vec![],
                    },
                    host: "x86_64-pc-windows-msvc".to_owned(),
                    short_version_string: "rustc 1.80.0-nightly (6e1d94708 2024-05-10)".to_owned(),
                    commit_hash: Some("6e1d94708a0a4a35ca7e46c6cac98adf62fe800e".to_owned()),
                    commit_date: Some("2024-05-10".to_owned()),
                    build_date: None,
                    channel: Channel::Nightly,
                }
            }
            