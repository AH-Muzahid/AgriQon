import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsMock } from '../mock/products.mock';
import { inventoryMock } from '../mock/inventory.mock';
import { customersMock } from '../mock/customers.mock';
import { ordersMock } from '../mock/orders.mock';
import { invoicesMock } from '../mock/invoices.mock';
import { paymentsMock } from '../mock/payments.mock';
import { organizationMock } from '../mock/organization.mock';

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
import { CreateStockAdjustmentInput } from '@/types/contracts/inventory.contract';
import { CreateCustomerInput, UpdateCustomerInput } from '@/types/contracts/customer.contract';
import { CreateOrderInput } from '@/types/contracts/order.contract';
import { CreateInvoiceInput } from '@/types/contracts/invoice.contract';
import { CreatePaymentInput } from '@/types/contracts/payment.contract';
import { UpdateOrganizationInput } from '@/types/contracts/organization.contract';

// --- PRODUCT HOOKS ---
export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productsMock.list(),
  });
}

export function useProduct(sku: string) {
  return useQuery({
    queryKey: productKeys.detail(sku),
    queryFn: () => productsMock.getById(sku),
    enabled: !!sku,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsMock.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct(sku: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProductInput) => productsMock.update(sku, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sku: string) => productsMock.delete(sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// --- INVENTORY HOOKS ---
export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: () => inventoryMock.list(),
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => inventoryMock.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useUpdateInventory(sku: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => inventoryMock.update(sku, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

// --- CUSTOMER HOOKS ---
export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: () => customersMock.list(),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersMock.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customersMock.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => customersMock.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

// --- ORDER HOOKS ---
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => ordersMock.list(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersMock.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersMock.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => ordersMock.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// --- INVOICE HOOKS ---
export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.lists(),
    queryFn: () => invoicesMock.list(),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesMock.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => invoicesMock.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

// --- PAYMENT HOOKS ---
export function usePayments() {
  return useQuery({
    queryKey: paymentKeys.lists(),
    queryFn: () => paymentsMock.list(),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentInput) => paymentsMock.create(input),
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
    queryFn: () => organizationMock.getDetails(),
  });
}

export function useUpdateOrganizationDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => organizationMock.updateDetails(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.profile() });
    },
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: organizationKeys.warehouses(),
    queryFn: () => organizationMock.listWarehouses(),
  });
}

export function useOrgUsers() {
  return useQuery({
    queryKey: organizationKeys.users(),
    queryFn: () => organizationMock.listUsers(),
  });
}

export function useOrgRoles() {
  return useQuery({
    queryKey: organizationKeys.roles(),
    queryFn: () => organizationMock.listRoles(),
  });
}

export function useOrgAuditLogs() {
  return useQuery({
    queryKey: organizationKeys.auditLogs(),
    queryFn: () => organizationMock.listAuditLogs(),
  });
}

export function useSubscriptionUsage() {
  return useQuery({
    queryKey: [...organizationKeys.all, 'subscriptionUsage'],
    queryFn: () => organizationMock.getSubscriptionUsage(),
  });
}
