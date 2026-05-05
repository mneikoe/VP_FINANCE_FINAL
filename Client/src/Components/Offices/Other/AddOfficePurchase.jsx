import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Button, Row, Col, Card, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  createOfficePurchase,
  fetchOfficePurchaseByID,
  updateOfficePurchase,
} from "../../../redux/feature/OfficePurchase/PurchaseThunx";
import { clearCurrent } from "../../../redux/feature/OfficePurchase/PurchaseSlice";

const { TextArea } = Input;

function AddOfficePurchase({ setActiveTab, editId, setEditId }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { current, loading } = useSelector((state) => state.officePurchase);

  useEffect(() => {
    if (editId) dispatch(fetchOfficePurchaseByID(editId));
    else form.resetFields();
  }, [dispatch, editId, form]);

  useEffect(() => {
    if (current && editId) {
      form.setFieldsValue({
        ...current,
        date: current.date ? dayjs(current.date) : null,
      });
    }
  }, [current, editId, form]);

  const onValuesChange = (changedValues, allValues) => {
    if (changedValues.ratePerUnit !== undefined || changedValues.quantity !== undefined) {
      const rate = parseFloat(allValues.ratePerUnit || 0);
      const qty = parseFloat(allValues.quantity || 0);
      form.setFieldsValue({ amount: (rate * qty).toFixed(2) });
    }
  };

  const onFinish = (values) => {
    const data = new FormData();
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null) {
        if (key === "date") {
          data.append(key, values[key].format("YYYY-MM-DD"));
        } else if (key !== "invoicePdf") {
          data.append(key, values[key]);
        }
      }
    });

    if (values.invoicePdf && values.invoicePdf.file) {
      data.append("invoicePdf", values.invoicePdf.file.originFileObj);
    } else if (!editId) {
      message.error("Please upload the invoice PDF");
      return;
    }

    if (editId) {
      dispatch(updateOfficePurchase({ id: editId, data }));
    } else {
      dispatch(createOfficePurchase(data));
    }

    dispatch(clearCurrent());
    setEditId(null);
    setActiveTab("view");
    form.resetFields();
  };

  return (
    <Card className="mt-3 shadow-sm border-0">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        requiredMark={false}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>Purchase Date</strong>} name="date" rules={[{ required: true }]}>
              <DatePicker className="w-100" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>Voucher Number</strong>} name="vrNo" rules={[{ required: true }]}>
              <Input placeholder="Enter voucher number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>Invoice Number</strong>} name="invoiceNo" rules={[{ required: true }]}>
              <Input placeholder="Enter invoice number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>Head of Account</strong>} name="headOfACs" rules={[{ required: true }]}>
              <Input placeholder="Enter head of account" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>Particular</strong>} name="itemParticulars" rules={[{ required: true }]}>
              <Input placeholder="Enter particulars" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>Name of Firm/Company</strong>} name="firmName" rules={[{ required: true }]}>
              <Input placeholder="Enter firm or company name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>Address</strong>} name="address">
              <Input placeholder="Enter address" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={<strong>Contact Number</strong>} name="contactNumber">
              <Input placeholder="Enter contact" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={<strong>Rate</strong>} name="ratePerUnit" rules={[{ required: true }]}>
              <Input type="number" placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={<strong>Quantity</strong>} name="quantity" rules={[{ required: true }]}>
              <Input type="number" placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={<strong>Amount</strong>} name="amount">
              <Input type="number" readOnly placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label={<strong>Remark</strong>} name="remark">
              <TextArea rows={2} placeholder="Any remarks..." />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label={<strong>Upload Invoice PDF</strong>} name="invoicePdf">
              <Upload beforeUpload={() => false} maxCount={1} accept=".pdf">
                <Button icon={<UploadOutlined />}>Select PDF</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className="mb-0">
          <Button type="primary" htmlType="submit" loading={loading}>
            {editId ? "Update Purchase" : "Save Purchase"}
          </Button>
          {editId && (
            <Button className="ms-2" onClick={() => { setEditId(null); setActiveTab("view"); }}>
              Cancel
            </Button>
          )}
        </Form.Item>
      </Form>
    </Card>
  );
}

export default AddOfficePurchase;
