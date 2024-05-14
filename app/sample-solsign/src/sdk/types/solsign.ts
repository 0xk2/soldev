/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solsign.json`.
 */
export type Solsign = {
  address: 's1g2tZuBvLAdvrvgp7utJ93LKjcjhfbEk5EHHWnF3yQ';
  metadata: {
    name: 'solsign';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'activateDocument';
      discriminator: [54, 250, 225, 163, 44, 22, 231, 35];
      accounts: [
        {
          name: 'document';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [];
    },
    {
      name: 'anullDocument';
      discriminator: [87, 95, 194, 38, 24, 180, 177, 152];
      accounts: [
        {
          name: 'document';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [];
    },
    {
      name: 'changeCreatorUri';
      discriminator: [217, 162, 0, 108, 21, 108, 43, 108];
      accounts: [
        {
          name: 'profile';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'uri';
          type: 'string';
        }
      ];
    },
    {
      name: 'changeFee';
      discriminator: [96, 224, 42, 234, 47, 143, 77, 84];
      accounts: [
        {
          name: 'setting';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'fee';
          type: 'u64';
        }
      ];
    },
    {
      name: 'changeOwner';
      discriminator: [109, 40, 40, 90, 224, 120, 193, 184];
      accounts: [
        {
          name: 'setting';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'owner';
          type: 'pubkey';
        }
      ];
    },
    {
      name: 'changeTreasury';
      discriminator: [149, 121, 117, 178, 163, 21, 131, 36];
      accounts: [
        {
          name: 'setting';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'treasury';
          type: 'pubkey';
        }
      ];
    },
    {
      name: 'collectFee';
      discriminator: [60, 173, 247, 103, 4, 93, 130, 48];
      accounts: [
        {
          name: 'creator';
          writable: true;
        },
        {
          name: 'treasury';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [];
    },
    {
      name: 'createCreator';
      discriminator: [169, 133, 46, 117, 103, 44, 226, 217];
      accounts: [
        {
          name: 'profile';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [67, 82, 69, 65, 84, 79, 82];
              },
              {
                kind: 'account';
                path: 'user';
              }
            ];
          };
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'uri';
          type: 'string';
        }
      ];
    },
    {
      name: 'createDocument';
      discriminator: [108, 119, 64, 32, 231, 136, 51, 42];
      accounts: [
        {
          name: 'document';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [68, 79, 67, 85, 77, 69, 78, 84];
              },
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'account';
                path: 'profile.max';
                account: 'creatorProfile';
              }
            ];
          };
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'profile';
          writable: true;
        },
        {
          name: 'solsignProgram';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'uri';
          type: 'string';
        },
        {
          name: 'signers';
          type: {
            vec: 'pubkey';
          };
        }
      ];
    },
    {
      name: 'editDocumentUri';
      discriminator: [71, 148, 130, 89, 112, 177, 254, 196];
      accounts: [
        {
          name: 'document';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'uri';
          type: 'string';
        }
      ];
    },
    {
      name: 'initialize';
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'setting';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [83, 69, 84, 84, 73, 78, 71];
              }
            ];
          };
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'fee';
          type: 'u64';
        },
        {
          name: 'feeCollector';
          type: 'pubkey';
        }
      ];
    },
    {
      name: 'signDocument';
      discriminator: [56, 221, 82, 10, 105, 155, 159, 163];
      accounts: [
        {
          name: 'document';
        },
        {
          name: 'signature';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        }
      ];
      args: [
        {
          name: 'value';
          type: 'u8';
        }
      ];
    }
  ];
  accounts: [
    {
      name: 'creatorProfile';
      discriminator: [251, 250, 184, 111, 214, 178, 32, 221];
    },
    {
      name: 'document';
      discriminator: [226, 212, 133, 177, 48, 5, 171, 243];
    },
    {
      name: 'setting';
      discriminator: [38, 34, 107, 169, 198, 171, 123, 15];
    },
    {
      name: 'signature';
      discriminator: [93, 29, 138, 101, 101, 212, 176, 92];
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'documentAlreadyActivated';
      msg: 'Document is already activated';
    },
    {
      code: 6001;
      name: 'documentNotActivated';
      msg: 'Document is not activated yet';
    },
    {
      code: 6002;
      name: 'documentAnulled';
      msg: 'Document is anulled';
    },
    {
      code: 6003;
      name: 'documentNotAbleAcitvate';
      msg: 'Document cannot activate';
    },
    {
      code: 6004;
      name: 'unauthorized';
      msg: 'unauthorized';
    },
    {
      code: 6005;
      name: 'tooManySigners';
      msg: 'Too many signers';
    },
    {
      code: 6006;
      name: 'signatureAlreadySigned';
      msg: 'Signature already signed';
    }
  ];
  types: [
    {
      name: 'creatorProfile';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'max';
            type: 'u64';
          },
          {
            name: 'totalPaid';
            docs: ['To collect fee'];
            type: 'u64';
          },
          {
            name: 'toCollect';
            type: 'u64';
          },
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'uri';
            type: 'string';
          }
        ];
      };
    },
    {
      name: 'document';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'status';
            type: 'u8';
          },
          {
            name: 'signers';
            type: {
              vec: 'pubkey';
            };
          },
          {
            name: 'uri';
            type: 'string';
          }
        ];
      };
    },
    {
      name: 'setting';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'fee';
            type: 'u64';
          },
          {
            name: 'feeCollector';
            type: 'pubkey';
          },
          {
            name: 'owner';
            type: 'pubkey';
          }
        ];
      };
    },
    {
      name: 'signature';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'signer';
            type: 'pubkey';
          },
          {
            name: 'doc';
            type: 'pubkey';
          },
          {
            name: 'status';
            type: 'u8';
          }
        ];
      };
    }
  ];
};
