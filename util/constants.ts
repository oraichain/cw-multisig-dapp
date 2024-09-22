export const contracts = {
  orai1fs25usz65tsryf0f8d5cpfmqgr0xwup4kjqpa0: 'Oraichain:Foundation Multisig',
  orai1mzyjvrgsg8tvrmw9hfdea0extyx8mmkmk07qg52lpygwjkhz3gqqcr3e4x:
    'Oraichain-Foundation-ORAI-Allocation',
  orai1ht5t8hc4q3tkw30pv76azygpkpys0mm8mtxpcc83nqtz7fh496nsuz4daw:
    'Oraichain-Foundation-Operation-Cash',
  orai1dugk9jpxwkyd0gt20344vu3ltx6083zjkv5pygt8hhtv8u420k7s32wvky:
    'Oraichain:Ecosystem Multisig',
  orai1fwq0ct8ww0hm574vsdrhj7p5h0rd0vcz2hxsd0hfufwdlw4u78ksp4wj4y:
    'Oraichain: DAO Multisig',
  orai1v9zcn396nwztsuc2q0a38rrg0dx25s3097wrd9y3lvmq8x3rehlsyeazsz:
    'Oraichain-Labs-Treasury',
  orai1hpfrkt4rs9p8pcgwjy8juc9ewr7hgu8365trc7lf37lsyq44yhrs2pj7n8:
    'Oraichain-Labs-Operation-Cash',
  orai1lq2tqyvlyg3thedv0cf08m8ea880z298sqd7p33z57cktlgc9whqrrg3z2:
    'Oraichain-Labs-LP1',
  orai1y4rx6u77vgrje0y99h3vxtsrqepayuk284ss2az8y6lcc6dr30eqvjz057:
    'Oraichain-Labs-LP2',
  orai1grmh060ugaxkewwe5c7vg6pmc9q70lkucxp4vf2n9p2vk7htczkq3hdtmu:
    'DeFi-Multisig-Fund-Treasury',
  orai19nns6szdkx9zrayp3yy6jfwgpm2xe4q3dpnftsxvd9xmpd2h9ejqm9z88h:
    'DeFi-Multisig-LP',
  orai1kksknvjy8hjkxlqzwqyghll7djz3854huqn7up4d20ad6hp5sglsyyfe4k:
    'DeFi Fund Management Multisig',
  orai1wn0qfdhn7xfn7fvsx6fme96x4mcuzrm9wm3mvlunp5e737rpgt4qndmfv8:
    'DeFi Operation Multisig',
  orai15uk2u2mrxusz3aft3asuc5fcqku884dqwffkqfdxmyqvx23atansht6zc7:
    'ORAIX-Team-Operation-Cash',
  orai1zvmgh6gaajr98m43wlcne8ghjxvcavefa8khe753f270duvhc2cs8n7xs3:
    'ORAIX-Insurance-Fund',
  orai1nk22lezd49a3pkmltx3yyjmzk79nef3cdsag7q3tll6kv9xqcyzqut9486:
    'OCH-Fund-Oraichain Multisig',
  orai1duyupjercjkhrjr33s0nkq0hr0y59e3cufjpavehul9c92626arspytrjf:
    'OCH Multisig',
  orai13g792u75auyue7dxwp75q5gr2pjvtsycvnh80cw4pgk02j9ckqcq2lkfl5:
    'OCH-Ecosystem Multisig',
  orai12l8crutcjxdp0tkdp9yrf0ddujk5se9rrk0rxh3epdckzju4knqsh6vw9s:
    'OCH-Community Multisig',
  orai167lluk7svl2dfp2gx6s7qpkqqvkhggattgdgmzxkjvq7h5znpghsu658uu:
    'AiRight Fund',
  orai1ux58gsuj3cnjvehpnu9k32u3kmtskfghljhn3yqqwfdhve34fcfq26llsf:
    'SmartML-ORAI-Allocation',
  orai1rkktlamqzqr4p8ap462aumsktdscndrk5pfccu884e5rn730a4dsgszw0p:
    'SmartML-Revenue-All',
  orai1n3zhqszadep7h02vq9zzeat23ll2wymcaeuzupecxexfspsge7cs72rg4r:
    'KawaiiQ-Team-Operation-Cash',
  orai1nqwk32nt37s2emkss2595pxdmck768jzdenecckmectq40egtpwstddejm:
    'CUPI Multisig',
};

export const users = {
  orai1sukkexujpz2trec6x8t6c3dlngc52c2t5m2q29: 'Chung Dao',
  orai1zm4zwxxtwe44aymcpp9qj94dew63guv58ncrj6: 'Chung Dao',
  orai1vxskpekkkur8atse58vmkpgjy0sxmv5v2a4j3e: 'Canh Tuan',
  orai1gpp3r6q07kgmnzqzdd2g0fm2hzv53qk3umnfj7: 'Tung Do',
  orai1ur2vsjrjarygawpdwtqteaazfchvw4fg6uql76: 'Tu Pham',
  orai17a7yeypmflmfmndelpue2cdq4yh2lf4ujg4s6v: 'Chu Tu',
  orai1wzqgtqtyzjm8js2tucxxln0h80v3x55vhjdfft: 'Trung Nguyen',
  orai14h0n2nlfrfz8tn9usfyjrxqd23fhj9a0ec0pm7: 'Duc Pham',
};

export const slugify = (text: string) =>
  text
    .normalize('NFKD')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-:]+/g, '')
    .replace(/[-:_\s]+/g, '-')
    .replace(/-$/g, '');

export const nameToContracts = Object.fromEntries(
  Object.entries(contracts).map(([contract, label]) => [
    slugify(label),
    contract,
  ])
);
