export interface Order {
  order_id: number;
  type_id: number;
  location_id: number;
  system_id: number;
  volume_total: number;
  volume_remain: number;
  min_volume: number;
  price: number;
  is_buy_order: boolean;
  duration: number;
  issued: string;
  range: string;
}

export interface Group {
  market_group_id: number;
  name: string;
  description: string;
  types: number[];
  parent_group_id: number;
}