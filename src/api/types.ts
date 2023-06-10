export interface AutoItem {
  kind: string;
  name: string;
  id: string;
}

export enum QueryState {
  InTransit = '0',
  InTransitCity = '1001',
  InTransitRoad = '1002',
  InTransitChange = '1003',
  Accepted = '1',
  AcceptedPending = '101',
  AcceptedProcessing = '102',
  AcceptedCompleted = '103',
  Question = '2',
  QuestionDeliveringTimeout = '201',
  QuestionTimeout = '202',
  QuestionReject = '203',
  QuestionDelivering = '204',
  QuestionStation = '205',
  QuestionConact = '206',
  QuestionOut = '207',
  QuestionOnHold = '208',
  QuestionDamage = '209',
  QuestionCancel = '210',
  Delivered = '3',
  DeliveredSelf = '301',
  DeliveredFailed = '302',
  DeliveredOther = '303',
  DeliveredStation = '304',
  Reject = '4',
  RejectDestory = '401',
  RejectSelf = '14',
  Delivering = '5',
  DeliveringStation = '501',
  Return = '6',
  Transfer = '7',
  CheckPoint = '8',
  CheckPointPending = '10',
  CheckPointProcessing = '11',
  CheckPointCompleted = '12',
  CheckPointError = '13',
  Error = '999',
}

export interface QueryItem {
  id: string;
  kind: string;
  phone?: string;
  state: string;
  updatedAt: string;
  data: { context: string; time: string }[];
}

export interface QueryParams {
  phone?: string;
  id: string;
  kind: string;
}

export interface KuaidiClient {
  auto(id: string): Promise<AutoItem[]>;
  query(params: QueryParams): Promise<QueryItem>;
}
