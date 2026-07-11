export type OrderStatus = 'pending' | 'making' | 'ready' | 'completed';

export interface MenuItem {
	id: string;
	name: string;
	description: string | null;
	price: number;
	category: string;
	image_url: string | null;
	is_sold_out: boolean;
	sort_order: number;
	created_at: string;
}

export interface Order {
	id: string;
	order_number: number;
	customer_name: string;
	has_tumbler: boolean;
	status: OrderStatus;
	notified_at: string | null;
	total_price: number;
	created_at: string;
}

export interface OrderItem {
	id: string;
	order_id: string;
	menu_item_id: string | null;
	menu_name: string;
	unit_price: number;
	quantity: number;
}

export interface OrderWithItems extends Order {
	order_items: OrderItem[];
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	pending: '주문 접수',
	making: '제조 중',
	ready: '픽업 대기',
	completed: '수령 완료'
};
