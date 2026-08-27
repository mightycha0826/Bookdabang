export type OrderStatus = 'pending' | 'ready' | 'completed';

export interface MenuItem {
	id: string;
	name: string;
	description: string | null;
	category: string;
	image_url: string | null;
	is_sold_out: boolean;
	sort_order: number;
	created_at: string;
}

export interface Order {
	id: string;
	order_number: number;
	student_id: string;
	name: string;
	table_number: number;
	has_tumbler: boolean;
	menu_item_id: string | null;
	menu_name: string;
	refill_count: number;
	status: OrderStatus;
	notified_at: string | null;
	created_at: string;
}

export interface StoreStatus {
	id: number;
	is_open: boolean;
	updated_at: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	pending: '주문 접수',
	ready: '픽업 대기',
	completed: '수령 완료'
};
