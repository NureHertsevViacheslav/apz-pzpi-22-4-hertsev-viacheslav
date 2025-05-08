class Computer {
public:    
void setCPU(const std::string& cpu) { this->cpu = cpu; }
void setRAM(const std::string& ram) { this->ram = ram; }
void setStorage(const std::string& storage) { this->storage = storage; }
void specs() const {
std::cout << "CPU: " << cpu << ", RAM: " << ram << ", Storage: " << storage << std::endl;    }
private:    
std::string cpu, ram, storage;
 };
 class Builder {
public:
virtual void buildCPU() = 0;
virtual void buildRAM() = 0;
virtual void buildStorage() = 0;
virtual Computer getResult() = 0;
};
class GamingPCBuilder : public Builder {
private:
Computer pc;
public:
void buildCPU() override { pc.setCPU("Intel i9"); }
void buildRAM() override { pc.setRAM("32GB"); }
void buildStorage() override { pc.setStorage("1TB SSD"); }
Computer getResult() override { return pc; }
};
class Director {
public:
void construct(Builder& builder) {
builder.buildCPU();
builder.buildRAM();
builder.buildStorage();
}
};
GamingPCBuilder builder;
Director director;
director.construct(builder);
Computer pc = builder.getResult();
pc.specs();

