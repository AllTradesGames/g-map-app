export interface Activity {
    id: number;
    ownerName: string;
    contactName: string;
    contactAddress: string;
    contactEmail: string;
    contactPhones: string[];
    leadType: string;
    status: ActivityStatus;
    dispositionName: string;
    dispositionColor: string;
    notes: string;
}

export interface User {
    status: UserStatus;
    logonName: string;
    permissions: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    sysPermission: boolean;
}



export enum ActivityStatus {
    PROSPECT,           // Activity is in the prospect sate
    LEAD,               // Activity is in the lead state
    TO_BE_SCHEDULED,    // Activity is marked "sold" and is to be scheduled by the office manager
    SCHEDULED,          // The Activity is scheduled and ready for installation
    INSTALL,            // The Activity is currently being installed
    SERVICE_CALL,       // Activity is a service call
    FINAL_PAPERWORK,    // The Installation is complete and the final office paperwork is to be completed
    ARCHIVE             // The activity is archived
}

export enum UserStatus {
    ENABLED,
    DISABLED,
    LOCKEDOUT
}

