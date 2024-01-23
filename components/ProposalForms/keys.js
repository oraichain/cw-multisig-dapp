import ChangeAdmin from "./ChangeAdmin";
import ChangeMembers from "./ChangeMembers";
import ChangeMigrationAdmin from "./ChangeMigrateAdmin";
import CreateTransfer from "./CreateTransfer";
import CustomContractExecute from "./CustomContractExecute";
import CustomStargateExecute from "./CustomStargateExecute";
import Delegate from "./Delegate";
import EditState from "./EditState";
import MigrateContract from "./MigrateContract";
import TrasnferCw20 from "./TransferCw20";
import Undelegate from "./Undelegate";

const keys = [
    {
        key: 'transfer',
        className: CreateTransfer,
    },
    {
        key: 'delegate',
        className: Delegate,
    },
    {
        key: 'undelegate',
        className: Undelegate,
    },
    {
        key: 'transfer-cw20',
        className: TrasnferCw20,
    },
    {
        key: 'custom-contract-execute',
        className: CustomContractExecute,
    },
    {
        key: 'custom-stargate-execute',
        className: CustomStargateExecute,
    },
    {
        key: 'migrate-contract',
        className: MigrateContract,
    },
    {
        key: 'change-admin',
        className: ChangeAdmin,
    },
    {
        key: 'change-migration-admin',
        className: ChangeMigrationAdmin,
    },
    {
        key: 'change_members',
        className: ChangeMembers
    },
    {
        key: 'edit_multisig_state',
        className: EditState
    },
]

export default keys;
