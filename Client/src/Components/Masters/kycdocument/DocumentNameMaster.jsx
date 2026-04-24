import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  List,
  Popconfirm,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKycDocuments,
  updateKycDocument,
} from "../../../redux/feature/kycdocument/documentthunx";

const { Title, Text } = Typography;

const parseCommaSeparatedNames = (value) =>
  [...new Set(String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean))];

function DocumentNameMaster() {
  const dispatch = useDispatch();
  const { documents, loading } = useSelector((state) => state.kycdoc);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [editingName, setEditingName] = useState("");
  const [newEditingName, setNewEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchKycDocuments());
  }, [dispatch]);

  const selectedType = useMemo(
    () => documents.find((doc) => doc._id === selectedTypeId),
    [documents, selectedTypeId]
  );

  const updateNames = async (nextNames, successMessage) => {
    if (!selectedTypeId) {
      message.warning("Please select document type first");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateKycDocument({
          id: selectedTypeId,
          updatedData: { documentNames: [...new Set(nextNames)] },
        })
      ).unwrap();
      message.success(successMessage);
      await dispatch(fetchKycDocuments());
    } catch (error) {
      message.error(error || "Failed to update document names");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBulkNames = async () => {
    const incomingNames = parseCommaSeparatedNames(bulkNames);
    if (!incomingNames.length) {
      message.warning("Enter at least one document name");
      return;
    }
    const existing = selectedType?.documentNames || [];
    await updateNames([...existing, ...incomingNames], "Document names added");
    setBulkNames("");
  };

  const handleDeleteName = async (name) => {
    const existing = selectedType?.documentNames || [];
    await updateNames(
      existing.filter((item) => item !== name),
      "Document name removed"
    );
    if (editingName === name) {
      setEditingName("");
      setNewEditingName("");
    }
  };

  const handleRenameName = async () => {
    const nextName = newEditingName.trim();
    if (!editingName || !nextName) {
      message.warning("Select name and enter new value");
      return;
    }
    const existing = selectedType?.documentNames || [];
    const updated = existing.map((item) => (item === editingName ? nextName : item));
    await updateNames(updated, "Document name updated");
    setEditingName("");
    setNewEditingName("");
  };

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Document Name Master
            </Title>
            <Text type="secondary">
              Document type select karke uske multiple document names add/edit/delete karein.
            </Text>
          </div>

          <Form layout="vertical">
            <Form.Item label="Document Type" required style={{ maxWidth: 420 }}>
              <Select
                showSearch
                placeholder="Select document type"
                value={selectedTypeId || undefined}
                onChange={setSelectedTypeId}
                options={documents.map((doc) => ({ label: doc.name, value: doc._id }))}
              />
            </Form.Item>
          </Form>

          <Space wrap align="start" style={{ width: "100%" }}>
            <Card size="small" title="Add Multiple Names" style={{ minWidth: 360, flex: 1 }}>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder="PAN Card, Aadhaar Card, Passport"
                />
                <Button type="primary" onClick={handleAddBulkNames} loading={saving}>
                  Add
                </Button>
              </Space.Compact>
              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                Comma separated values dal sakte hain.
              </Text>
            </Card>

            <Card size="small" title="Rename Name" style={{ minWidth: 360, flex: 1 }}>
              <Space.Compact style={{ width: "100%" }}>
                <Select
                  placeholder="Select existing name"
                  style={{ width: "45%" }}
                  value={editingName || undefined}
                  onChange={(value) => {
                    setEditingName(value);
                    setNewEditingName(value);
                  }}
                  options={(selectedType?.documentNames || []).map((name) => ({
                    label: name,
                    value: name,
                  }))}
                />
                <Input
                  style={{ width: "35%" }}
                  placeholder="New name"
                  value={newEditingName}
                  onChange={(e) => setNewEditingName(e.target.value)}
                />
                <Button onClick={handleRenameName} loading={saving}>
                  Update
                </Button>
              </Space.Compact>
            </Card>
          </Space>

          <Card size="small" title="Mapped Document Names">
            {!selectedTypeId ? (
              <Empty description="Please select document type" />
            ) : (selectedType?.documentNames || []).length === 0 ? (
              <Empty description="No document names mapped yet" />
            ) : (
              <List
                loading={loading || saving}
                dataSource={selectedType?.documentNames || []}
                renderItem={(name) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key={`delete-${name}`}
                        title="Delete this document name?"
                        onConfirm={() => handleDeleteName(name)}
                      >
                        <Button danger size="small">
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <Tag color="blue">{name}</Tag>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
}

export default DocumentNameMaster;
