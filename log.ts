
export enum EventCategories {
  Infrastructure = 'Infrastructure',
  Application = 'Application',
  Business = 'Business'
}

export enum BusinessEventTypes {
  SP_SE = 'SP_SE',
  SP_CA = 'SP_CA',
  SP_RETURN = 'SP_RETURN',
  FB_API_SEND = 'FB_API_SEND',
  FB_API_SENT = 'FB_API_SENT',
  FB_API_RESPONSE = 'FB_API_RESPONSE'
}

export enum ApplicationEventTypes {
  NETWORK_API_CALL = 'NETWORK_API_CALL',
  NETWORK_API_RESPONSE = 'NETWORK_API_RESPONSE',
  EVENT_INVOKED = 'EVENT_INVOKED',
  TRY_CATCH_ERROR = 'TRY_CATCH_ERROR'
}

export enum ApplicationComponents {
  KAFKA = 'KAFKA',
  AXIOS = 'AXIOS'
}

export interface LogEntry {
  EventCategory: EventCategories;
  ApplicationName: string;
  Component: string;
  SubComponent?: string;
  EventType: BusinessEventTypes | ApplicationEventTypes;
  EventName: string;
}

