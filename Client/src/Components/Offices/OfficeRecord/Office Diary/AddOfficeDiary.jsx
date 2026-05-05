import React, { useEffect } from "react";
import { Form, Input, DatePicker, Button, Row, Col, Card, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  createOfficeDiary,
  fetchOfficeDiaryByID,
  updateOfficeDiary,
} from "../../../../redux/feature/OfficeDiary/OfficeDiaryThunx";

const { TextArea } = Input;

function AddOfficeDiary({ editId, setActiveTab, setEditId }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { current, loading } = useSelector((state) => state.officeDiary);

  useEffect(() => {
    if (editId) {
      dispatch(fetchOfficeDiaryByID(editId));
    } else {
      form.resetFields();
    }
  }, [editId, dispatch, form]);

  useEffect(() => {
    if (current && editId) {
      form.setFieldsValue({
        ...current,
        startDate: current.startDate ? dayjs(current.startDate) : null,
        endDate: current.endDate ? dayjs(current.endDate) : null,
        purchageDate: current.purchageDate ? dayjs(current.purchageDate) : null,
      });
    }
  }, [current, editId, form]);

  const onFinish = (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null) {
        if (["startDate", "endDate", "purchageDate"].includes(key)) {
          formData.append(key, values[key].format("YYYY-MM-DD"));
        } else if (key !== "diaryPdf") {
          formData.append(key, values[key]);
        }
      }
    });

    if (values.diaryPdf && values.diaryPdf.file) {
      formData.append("diaryPdf", values.diaryPdf.file.originFileObj);
    } else if (!editId) {
      message.error("Please upload a PDF document");
      return;
    }

    if (editId) {
      dispatch(updateOfficeDiary({ id: editId, formData }));
    } else {
      dispatch(createOfficeDiary(formData));
    }

    form.resetFields();
    setEditId(null);
    setActiveTab("view");
  };

  return (
    <Card className="mt-3 shadow-sm border-0">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>Particulars</strong>} name="particulars">
              <Input placeholder="Enter particulars" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item 
              label={<strong>Company Name</strong>} 
              name="orgName" 
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>Service Person</strong>} name="servicePerson">
              <Input placeholder="Enter service person name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>Mobile Number</strong>} name="contactNo">
              <Input placeholder="Enter mobile number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>Contact Number</strong>} name="officeContactNo">
              <Input placeholder="Enter contact number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<strong>License No.</strong>} name="licanceNo">
              <Input placeholder="Enter license number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>Purchase Date</strong>} name="purchageDate">
              <DatePicker className="w-100" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>Start Date</strong>} name="startDate">
              <DatePicker className="w-100" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>Renewal Date</strong>} name="endDate">
              <DatePicker className="w-100" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>Purchase Amount</strong>} name="amount">
              <Input type="number" placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>User Id</strong>} name="userId">
              <Input placeholder="Enter user id" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<strong>Password</strong>} name="password">
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item 
              label={<strong>Upload PDF Document</strong>} 
              name="diaryPdf"
            >
              <Upload 
                beforeUpload={() => false} 
                maxCount={1}
                accept=".pdf"
              >
                <Button icon={<UploadOutlined />}>Select PDF</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className="mb-0 mt-2">
          <Button type="primary" htmlType="submit" loading={loading} block={false}>
            {editId ? "Update Diary" : "Save Diary"}
          </Button>
          {editId && (
            <Button 
              className="ms-2" 
              onClick={() => { setEditId(null); form.resetFields(); setActiveTab("view"); }}
            >
              Cancel
            </Button>
          )}
        </Form.Item>
      </Form>
    </Card>
  );
}

export default AddOfficeDiary;
