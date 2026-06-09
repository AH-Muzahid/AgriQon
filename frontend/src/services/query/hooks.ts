import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../api/products.service';
import { inventoryService } from '../api/inventory.service';
import { customersService } from '../api/customers.service';
import { ordersService } from '../api/orders.service';
import { invoicesService } from '../api/invoices.service';
import { paymentsService } from '../api/payments.service';
import { organizationService } from '../api/organization.service';
import { apiClient } from '../api/client';

import {
  productKeys,
  inventoryKeys,
  customerKeys,
  orderKeys,
  invoiceKeys,
  paymentKeys,
  organizationKeys,
} from './query-keys';

import { CreateProductInput, UpdateProductInput } from '@/types/contracts/product.contract';
import { CreateCustomerInput, UpdateCustomerInput } from '@/types/contracts/customer.contract';
import { CreateOrderInput } from '@/types/contracts/order.contract';
import { CreateInvoiceInput } from '@/types/contracts/invoice.contract';
import { CreatePaymentInput } from '@/types/contracts/payment.contract';
import { UpdateOrganizationInput } from '@/types/contracts/organization.contract';

// --- PRODUCT HOOKS ---
export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productsService.list(),
  });
}

export function useProduct(sku: string) {
  return useQuery({
    queryKey: productKeys.detail(sku),
    queryFn: () => productsService.getById(sku),
    enabled: !!sku,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: UpdateProductInput }) => productsService.update(sku, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sku: string) => productsService.delete(sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// --- INVENTORY HOOKS ---
export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: () => inventoryService.list(),
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => inventoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useUpdateInventory(sku: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => inventoryService.update(sku, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

// --- CUSTOMER HOOKS ---
export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: () => customersService.list(),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customersService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) => customersService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

// --- ORDER HOOKS ---
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => ordersService.list(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => ordersService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// --- INVOICE HOOKS ---
export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.lists(),
    queryFn: () => invoicesService.list(),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => invoicesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

// --- PAYMENT HOOKS ---
export function usePayments(filters?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  invoiceId?: string;
  customerId?: string;
}) {
  return useQuery({
    queryKey: paymentKeys.list(filters || {}),
    queryFn: () => paymentsService.list(filters),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentsService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentInput) => paymentsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

// --- ORGANIZATION HOOKS ---
export function useOrganizationDetails() {
  return useQuery({
    queryKey: organizationKeys.profile(),
    queryFn: () => organizationService.getDetails(),
  });
}

export function useUpdateOrganizationDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => organizationService.updateDetails(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.profile() });
    },
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: organizationKeys.warehouses(),
    queryFn: () => organizationService.listWarehouses(),
  });
}

export function useOrgUsers() {
  return useQuery({
    queryKey: organizationKeys.users(),
    queryFn: () => organizationService.listUsers(),
  });
}

export function useOrgRoles() {
  return useQuery({
    queryKey: organizationKeys.roles(),
    queryFn: () => organizationService.listRoles(),
  });
}

export function useOrgAuditLogs() {
  return useQuery({
    queryKey: organizationKeys.auditLogs(),
    queryFn: () => organizationService.listAuditLogs(),
  });
}

export function useSubscriptionUsage() {
  return useQuery({
    queryKey: [...organizationKeys.all, 'subscriptionUsage'],
    queryFn: () => organizationService.getSubscriptionUsage(),
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; name: string; role: 'OWNER' | 'MANAGER' | 'STAFF' }) =>
      apiClient.post<any>('/organization/users/invite', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.users() });
    },
  });
}

// --- ANALYTICS HOOKS ---
export function useFinancialTrend(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['analytics', 'financial-trend', startDate, endDate],
    queryFn: async () => {
      const res = await apiClient.client.get('/analytics/financial-trend', {
        params: { startDate, endDate },
      });
      const body = res.data || {};
      return body.data || body;
    },
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['analytics', 'dashboard-summary'],
    queryFn: async () => {
      const res = await apiClient.client.get('/dashboard/summary');
      const body = res.data || {};
      return body.data || body;
    },
  });
}
